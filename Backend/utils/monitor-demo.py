import asyncio
import grpc
import base58
from solana.rpc.async_api import AsyncClient
from solders.pubkey import PublicKey
from solana.rpc.types import TokenAccount
from solana.rpc.core import LAMPORTS_PER_SOL
from solana.rpc.commitment import Confirmed
from solana.rpc.providers.http import HttpProvider
from metaplex.metadata import Metadata

# 配置聪明钱包地址和RPC客户端
SMART_MONEY_ADDR = ["orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8"]
GRPC_SERVER = "https://grpc.chainbuff.com"
SOLANA_HTTP_RPC = "https://api.mainnet-beta.solana.com"

# 解析余额变动的函数
async def check_balances(data, connection):
    transaction = data.get("transaction")
    if not transaction:
        return

    # Solana余额
    meta = transaction.get("meta")
    pre_balance = meta["preBalances"][0]
    post_balance = meta["postBalances"][0]
    balance_change = (post_balance - pre_balance) / LAMPORTS_PER_SOL
    print(f"Balance change: {balance_change} SOL")

    # Token余额
    pre_token_balances = meta.get("preTokenBalances", [])
    post_token_balances = meta.get("postTokenBalances", [])

    for post_balance in post_token_balances:
        owner = post_balance.get("owner")
        if owner in SMART_MONEY_ADDR:
            mint = post_balance["mint"]
            post_amount = post_balance["uiTokenAmount"]["uiAmount"]
            pre_amount = next(
                (
                    pre["uiTokenAmount"]["uiAmount"]
                    for pre in pre_token_balances
                    if pre["owner"] == owner and pre["mint"] == mint
                ),
                0,
            )
            token_balance_change = post_amount - pre_amount
            metadata_pda = PublicKey(mint)
            # 获取代币名称（此处依赖Metaplex Metadata库）
            try:
                metadata = await Metadata.load(connection, metadata_pda)
                token_name = metadata.data.name
            except Exception as e:
                token_name = "Unknown Token"
            print(f"Token change: {token_balance_change} {token_name} ({mint})")

# gRPC监听并处理交易
async def grpc_listener():
    async with grpc.aio.insecure_channel(GRPC_SERVER) as channel:
        # 初始化客户端
        stub = YourGrpcStub(channel)
        request = YourSubscribeRequest(
            transactions={
                "vote": False,
                "failed": False,
                "accountInclude": SMART_MONEY_ADDR,
            },
            commitment=Confirmed,
        )

        # 建立流
        async for response in stub.Subscribe(request):
            if response.transaction:
                account_keys = [
                    base58.b58encode(key).decode() for key in response.transaction["message"]["accountKeys"]
                ]
                if any(addr in account_keys for addr in ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P", "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"]):
                    async with AsyncClient(SOLANA_HTTP_RPC) as connection:
                        await check_balances(response, connection)

# 主函数入口
if __name__ == "__main__":
    asyncio.run(grpc_listener())