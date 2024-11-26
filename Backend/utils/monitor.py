from datetime import datetime
from solana.rpc.async_api import AsyncClient
from sqlalchemy.orm import Session
import asyncio
import json
from . import crud, models
from typing import List, Dict
import websockets
import base58
import aiohttp
from spl.token.client import Token
from spl.token.constants import TOKEN_PROGRAM_ID
from solders.pubkey import Pubkey


class SolanaMonitor:
    def __init__(self, db: Session, rpc_url: str = "https://api.mainnet-beta.solana.com"):
        self.db = db
        self.client = AsyncClient(rpc_url)
        self.wallets = []
        self.ws_url = rpc_url.replace('https', 'wss')
        self.token_cache = {}  # 缓存代币信息
    
    async def load_wallets(self):
        """从数据库加载需要监控的钱包"""
        self.wallets = crud.get_wallets(self.db)
        return [wallet.address for wallet in self.wallets]
    
    async def get_token_info(self, mint_address: str, pubkey: str):
        """获取代币信息，如果数据库没有则从链上获取并保存"""
        # 先从缓存中查找
        if mint_address in self.token_cache:
            print(f"从缓存中获取代币信息: {mint_address}")
            return self.token_cache[mint_address]
            
        # 从数据库查找
        token = crud.get_token_by_address(self.db, mint_address)
        if token:
            print(f"从数据库中获取代币信息: {mint_address}")
            self.token_cache[mint_address] = token
            return token
            
        try:
            print(f"从链上获取代币信息: {mint_address}")
             # 从 Jupiter API 获取代币信息
            jupiter_url = f"https://api.phantom.app/search/v1?query={mint_address}&chainIds=solana%3A101&platform=extension&pageSize=50&searchTypes=fungible&searchContext=swapper&supportedNetworkIds=solana%3A101%2Ceip155%3A1%2Ceip155%3A137%2Ceip155%3A8453"
            async with aiohttp.ClientSession() as session:
                async with session.get(jupiter_url) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        # 获取第一个结果
                        results = data.get("results", [])
                        if results and results[0].get("type") == "fungible":
                            token_info = results[0].get("data", {}).get("data", {})
                            
                            if token_info:
                                token_data = {
                                    "contract_address": mint_address,
                                    "decimals": token_info.get("decimals", 6),
                                    "symbol": token_info.get("symbol", f"PUMP-{mint_address[:4]}"),
                                    "name": token_info.get("name", f"Pump Token {mint_address[:8]}"),
                                    "current_price": 0.0  # 价格需要从其他 API 获取
                                }
                            else:
                                token_data = {
                                    "contract_address": mint_address,
                                    "decimals": 6,
                                    "symbol": f"PUMP-{mint_address[:4]}",
                                    "name": f"Pump Token {mint_address[:8]}",
                                    "current_price": 0.0
                                }
            
            token = crud.create_token(self.db, token_data)
            self.token_cache[mint_address] = token
            print(f"已创建新代币: {token.symbol} ({mint_address})")
            return token
               
                
        except Exception as e:
            print(f"获取代币信息错误: {str(e)}")
            token_data = {
                "contract_address": mint_address,
                "decimals": 6,
                "symbol": f"RAY-{mint_address[:4]}",
                "name": f"Raydium Token {mint_address[:8]}",
                "current_price": 0.0
            }
            token = crud.create_token(self.db, token_data)
            self.token_cache[mint_address] = token
            return token

    async def get_transaction_details(self, signature: str):
        """获取交易详细信息"""
        try:
            tx_info = await self.client.get_transaction(
                signature,
                encoding="jsonParsed"
            )
            return tx_info
        except Exception as e:
            print(f"获取交易详情错误: {str(e)}")
            return None

    async def process_transaction(self, tx_data: Dict):
        """处理交易数据并存储到数据库"""
        try:
            # 从 JSON 响应中获取关键信息
            value = tx_data.get("result", {}).get("value", {})
            pubkey = value.get("pubkey")
            account = value.get("account", {})
            parsed = account.get("data", {}).get("parsed", {})
            
            if not parsed:
                return

            token_info = parsed.get("info", {})
            owner_address = token_info.get("owner")
            mint_address = token_info.get("mint")
            
            print(f"处理交易: pubkey={pubkey}, owner={owner_address}, mint={mint_address}")
            
            # 查找对应的钱包
            wallet = next((w for w in self.wallets if w.address == owner_address), None)
            if not wallet:
                return

            # 获取代币信息
            token = await self.get_token_info(mint_address,pubkey)
            if not token:
                print(f"无法获取代币信息: {mint_address}")
                return

            # 获取代币数量信息
            token_amount = token_info.get("tokenAmount", {})
            current_amount = float(token_amount.get("uiAmount", 0))
            
            # 检查是否有状态变化
            previous_amount = self.account_states.get(pubkey, 0)
            if current_amount != previous_amount:
                # 获取交易签名
                slot = tx_data.get("result", {}).get("context", {}).get("slot", "")
                tx_hash = f"{pubkey}_{slot}"
                
                # 当代币数量增加时是买入，减少时是卖出
                tx_type = "buy" if current_amount > previous_amount else "sell"
                amount_change = abs(current_amount - previous_amount)
                
                print(f"DEBUG: previous={previous_amount}, current={current_amount}, type={tx_type}, "
                      f"change={amount_change} {'增加' if current_amount > previous_amount else '减少'}")
                
                # 计算 USD 金额
                usd_amount = amount_change * token.current_price if token.current_price else 0
                
                transaction = {
                    "tx_hash": tx_hash,
                    "amount": usd_amount,
                    "tx_type": tx_type,
                    "quantity": amount_change,
                    "timestamp": datetime.now(),
                    "wallet_id": wallet.id,
                    "token_id": token.id
                }
                
                # 直接创建交易记录
                crud.create_transaction(self.db, transaction)
                print(f"新交易已记录: {tx_type} {amount_change} {token.symbol} "
                      f"(价值: ${usd_amount:.2f}, 钱包: {wallet.address})")
                
                # 更新状态
                self.account_states[pubkey] = current_amount
            
        except Exception as e:
            print(f"处理交易错误: {str(e)}")
            self.db.rollback()

    async def start_monitoring(self):
        print("start_monitoring-----------")
        addresses = await self.load_wallets()
        if not addresses:
            print("没有要监控的钱包地址")
            return

        # Raydium V4 AMM Program ID
        RAYDIUM_V4_PROGRAM_ID = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"

        monitor_addresses = [RAYDIUM_V4_PROGRAM_ID] + addresses
        print(f"正在监控以下地址:")
        for addr in monitor_addresses:
            print(f"- {addr}")

        # Helius 的订阅消息格式
        subscription_message = {
            "jsonrpc": "2.0",
            "id": "420",
            "method": "transactionSubscribe",
            "params": [
                {
                    "accountInclude": monitor_addresses  # 监控 Raydium 程序和所有钱包地址
                },
                {
                    "commitment": "processed",
                    "encoding": "jsonParsed",
                    "transactionDetails": "full",
                    "showRewards": True,
                    "maxSupportedTransactionVersion": 0
                }
            ]
        }

        self.account_states = {}

        while True:
            try:
                # 连接 Helius WebSocket（需要添加 API key）
                helius_ws_url = "wss://mainnet.helius-rpc.com/?api-key=6f5e8e8c-5e87-43c4-bbfa-b733a13d81da"
                async with websockets.connect(helius_ws_url, ping_interval=30) as websocket:
                    print(f"已连接到 Helius WebSocket")
                    
                    # 发送订阅请求
                    await websocket.send(json.dumps(subscription_message))
                    print("已发送订阅请求")
                    
                    # 发送定期的 ping
                    ping_task = asyncio.create_task(self._ping_websocket(websocket))
                    
                    while True:
                        try:
                            response = await websocket.recv()
                            print(f"收到消息: {response}")
                            transaction_data = json.loads(response)
                            
                            if "params" in transaction_data:
                                await self.process_transaction(transaction_data["params"])
                            
                        except websockets.ConnectionClosed:
                            print("WebSocket 连接已断开，准备重连...")
                            if not ping_task.done():
                                ping_task.cancel()
                            break
                        except Exception as e:
                            print(f"处理消息错误: {str(e)}")
                            continue
                            
            except Exception as e:
                print(f"连接错误: {str(e)}")
                print("5秒后尝试重连...")
                await asyncio.sleep(5)

    async def _ping_websocket(self, websocket):
        """定期发送 ping 以保持连接"""
        try:
            while True:
                if websocket.open:
                    await websocket.ping()
                    print("Ping 已发送")
                await asyncio.sleep(30)  # 每30秒发送一次 ping
        except Exception as e:
            print(f"Ping 错误: {str(e)}")


async def run_monitor(db: Session):
    """运行监控器的入口函数"""
    print("开始监控")
    monitor = SolanaMonitor(db)
    await monitor.start_monitoring()
