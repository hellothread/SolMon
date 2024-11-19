from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from .database import get_db
from . import crud, schemas

router = APIRouter()

# 钱包CRUD操作
@router.post("/wallets/", response_model=schemas.Wallet)
def create_wallet(wallet: schemas.WalletCreate, db: Session = Depends(get_db)):
    db_wallet = crud.get_wallet_by_address(db, address=wallet.address)
    if db_wallet:
        raise HTTPException(status_code=400, detail="地址已存在")
    return crud.create_wallet(db=db, wallet=wallet)

@router.get("/wallets/", response_model=List[schemas.Wallet])
def read_wallets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    print("收到获取钱包列表请求")
    wallets = crud.get_wallets(db, skip=skip, limit=limit)
    print(f"返回钱包数量: {len(wallets)}")
    return wallets

@router.get("/wallets/{wallet_id}", response_model=schemas.Wallet)
def read_wallet(wallet_id: int, db: Session = Depends(get_db)):
    wallet = crud.get_wallet(db, wallet_id=wallet_id)
    if wallet is None:
        raise HTTPException(status_code=404, detail="钱包未找到")
    return wallet

@router.delete("/wallets/{wallet_id}")
def delete_wallet(wallet_id: int, db: Session = Depends(get_db)):
    wallet = crud.get_wallet(db, wallet_id=wallet_id)
    if wallet is None:
        raise HTTPException(status_code=404, detail="钱包未找到")
    crud.delete_wallet(db, wallet_id)
    return {"message": "钱包已删除"}

@router.put("/wallets/{wallet_id}", response_model=schemas.Wallet)
def update_wallet(wallet_id: int, wallet: schemas.WalletUpdate, db: Session = Depends(get_db)):
    db_wallet = crud.get_wallet(db, wallet_id=wallet_id)
    if db_wallet is None:
        raise HTTPException(status_code=404, detail="钱包未找到")
    return crud.update_wallet(db, wallet_id, wallet)

@router.post("/wallets/batch", response_model=schemas.BatchImportResponse)
def batch_create_wallets(wallets: List[schemas.WalletCreate], db: Session = Depends(get_db)):
    print(f"收到批量导入请求，钱包数量: {len(wallets)}")
    result = []
    errors = []
    
    for wallet in wallets:
        try:
            # 检查地址是否已存在
            if crud.get_wallet_by_address(db, address=wallet.address):
                errors.append(f"地址已存在: {wallet.address}")
                continue
                
            # 创建新钱包
            new_wallet = crud.create_wallet(db=db, wallet=wallet)
            # 转换为 Pydantic 模型
            result.append(schemas.Wallet.model_validate(new_wallet))
        except Exception as e:
            errors.append(f"导入失败 {wallet.address}: {str(e)}")
    
    response_data = schemas.BatchImportResponse(
        success=result,
        errors=errors,
        total_success=len(result),
        total_errors=len(errors)
    )
    
    print(f"导入完成，成功: {len(result)}, 失败: {len(errors)}")
    return response_data

# Token相关路由
@router.post("/tokens/", response_model=schemas.Token)
def create_token(token: schemas.TokenCreate, db: Session = Depends(get_db)):
    db_token = crud.get_token_by_symbol(db, symbol=token.symbol)
    if db_token:
        raise HTTPException(status_code=400, detail="代币已存在")
    return crud.create_token(db=db, token=token)

@router.get("/tokens/", response_model=List[schemas.Token])
def read_tokens(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tokens = crud.get_tokens(db, skip=skip, limit=limit)
    return tokens

@router.get("/tokens/{token_id}", response_model=schemas.Token)
def read_token(token_id: int, db: Session = Depends(get_db)):
    token = crud.get_token(db, token_id=token_id)
    if token is None:
        raise HTTPException(status_code=404, detail="代币未找到")
    return token

# TokenHolding相关路由
@router.get("/wallets/{wallet_id}/holdings/", response_model=List[schemas.TokenHolding])
def read_wallet_holdings(wallet_id: int, db: Session = Depends(get_db)):
    holdings = crud.get_wallet_holdings(db, wallet_id=wallet_id)
    return holdings

# Transaction相关路由
@router.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return crud.create_transaction(db=db, transaction=transaction)

@router.get("/wallets/{wallet_id}/transactions/", response_model=List[schemas.Transaction])
def read_wallet_transactions(wallet_id: int, db: Session = Depends(get_db)):
    transactions = crud.get_wallet_transactions(db, wallet_id=wallet_id)
    return transactions


@router.get("/transactions/monitoring", response_model=schemas.PaginatedResponse)
def read_monitoring_transactions(
    page: int = 1,
    size: int = 20, 
    db: Session = Depends(get_db)
):
    """获取所有监控地址的最新交易动态"""
    print(f"获取监控地址交易动态: 页码={page}, 每页数量={size}")
    
    # 计算跳过的记录数
    skip = (page - 1) * size
    
    # 获取数据
    result = crud.get_monitoring_transactions(db, skip=skip, limit=size)
    
    # 构造响应
    response = schemas.PaginatedResponse(
        items=result["items"],
        total=result["total"],
        page=page,
        size=size,
        total_pages=result["total_pages"]
    )
    
    print(f"返回交易数量: {len(result['items'])}, 总记录数: {result['total']}")
    return response
  

#   [{
#   "tx_hash": "0x0044556677889900112233445566778899aabbccddeeff001122334455667788",
#   "amount": 1890.45,
#   "tx_type": "sell",
#   "quantity": 18.9,
#   "timestamp": "2024-03-19T15:30:00",
#   "id": 13,
#   "wallet_id": 1,
#   "token_id": 3
# }]