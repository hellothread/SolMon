from solana.rpc.api import Client
import asyncio
from datetime import datetime
from . import crud
from .database import SessionLocal

class SolanaMonitor:
    def __init__(self):
        self.client = Client("https://api.mainnet-beta.solana.com")
        
    async def monitor_wallet(self, wallet_address: str):
        while True:
            try:
                # 获取最新的交易
                transactions = self.client.get_signatures_for_address(wallet_address)
                
                # 处理交易数据
                with SessionLocal() as db:
                    for tx in transactions.value:
                        # 解析交易详情并存储
                        tx_info = self.client.get_transaction(tx.signature)
                        # 这里需要根据实际情况解析交易数据
                        # 存储交易记录
                        crud.create_transaction(db, {...})
                
                await asyncio.sleep(10)  # 每10秒检查一次
                
            except Exception as e:
                print(f"监控错误: {str(e)}")
                await asyncio.sleep(30)  # 出错后等待30秒再试 