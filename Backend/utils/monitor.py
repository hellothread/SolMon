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
    
    async def get_token_info(self, mint_address: str):
        """获取代币信息，如果数据库没有则从链上获取并保存"""
        # 先从缓存中查找
        if mint_address in self.token_cache:
            return self.token_cache[mint_address]
            
        # 从数据库查找
        token = crud.get_token_by_address(self.db, mint_address)
        if token:
            self.token_cache[mint_address] = token
            return token
            
        try:
            # 从 Jupiter API 获取代币信息
            jupiter_url = "https://token.jup.ag/all"
            async with aiohttp.ClientSession() as session:
                async with session.get(jupiter_url) as resp:
                    tokens = await resp.json()
                    print(tokens)
                    token_info = next((t for t in tokens if t.get("address") == mint_address), None)
            
            if token_info:
                # 使用 Jupiter API 的信息
                token_data = {
                    "contract_address": mint_address,
                    "decimals": token_info.get("decimals", 6),
                    "symbol": token_info.get("symbol", mint_address[:6]),
                    "name": token_info.get("name", f"Token {mint_address[:6]}"),
                    "current_price": 0.0
                }
            else:
                # 如果找不到代币信息，使用默认值
                token_data = {
                    "contract_address": mint_address,
                    "decimals": 6,
                    "symbol": mint_address[:6],
                    "name": f"Token {mint_address[:6]}",
                    "current_price": 0.0
                }
            
            token = crud.create_token(self.db, token_data)
            self.token_cache[mint_address] = token
            print(f"已创建新代币: {token.symbol} ({mint_address})")
            return token
                
        except Exception as e:
            print(f"获取代币信息错误: {str(e)}")
            # 创建一个基本的代币记录
            token_data = {
                "contract_address": mint_address,
                "decimals": 6,
                "symbol": mint_address[:6],
                "name": f"Token {mint_address[:6]}",
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
            token = await self.get_token_info(mint_address)
            if not token:
                print(f"无法获取代币信息: {mint_address}")
                return

            # 获取代币数量信息
            token_amount = token_info.get("tokenAmount", {})
            current_amount = float(token_amount.get("uiAmount", 0))
            
            # 检查是否有状态变化
            previous_amount = self.account_states.get(pubkey, 0)
            if current_amount != previous_amount:
                # 确定交易类型
                tx_type = "sell" if current_amount < previous_amount else "buy"
                amount_change = abs(current_amount - previous_amount)
                
                transaction = {
                    "tx_hash": pubkey,
                    "amount": amount_change,
                    "tx_type": tx_type,
                    "quantity": amount_change,
                    "timestamp": datetime.now(),
                    "wallet_id": wallet.id,
                    "token_id": token.id
                }
                
                # 保存交易记录
                if not crud.get_transaction_by_hash(self.db, transaction["tx_hash"]):
                    crud.create_transaction(self.db, transaction)
                    print(f"新交易已记录: {tx_type} {amount_change} {token.symbol} (钱包: {wallet.address})")
                
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

        subscription_messages = [
            {
                "jsonrpc": "2.0",
                "id": i,
                "method": "programSubscribe",  
                "params": [
                    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",  # SPL Token 程序 ID
                    {
                        "encoding": "jsonParsed",
                        "commitment": "confirmed",
                        "filters": [
                            {
                                "memcmp": {
                                    "offset": 32,  # owner 地址在 Token 账户数据中的偏移量
                                    "bytes": address  # 监控的钱包地址
                                }
                            }
                        ]
                    }
                ]
            }
            for i, address in enumerate(addresses)
        ]

        # 保存每个账户的最新状态
        self.account_states = {}

        while True:
            try:
                async with websockets.connect(self.ws_url, ping_interval=30) as websocket:
                    for message in subscription_messages:
                        await websocket.send(json.dumps(message))
                        print(f"已订阅地址: {message['params'][1]['filters'][0]['memcmp']['bytes']}")
                    
                    while True:
                        try:
                            response = await websocket.recv()
                            print(response)
                            transaction_data = json.loads(response)
                            
                            if "params" in transaction_data:
                                await self.process_transaction(transaction_data["params"])
                            
                        except websockets.ConnectionClosed:
                            print("WebSocket 连接已断开，准备重连...")
                            break
                        except Exception as e:
                            print(f"处理消息错误: {str(e)}")
                            continue
                            
            except Exception as e:
                print(f"连接错误: {str(e)}")
                print("5秒后尝试重连...")
                await asyncio.sleep(5)


async def run_monitor(db: Session):
    """运行监控器的入口函数"""
    print("开始监控")
    monitor = SolanaMonitor(db)
    await monitor.start_monitoring()
