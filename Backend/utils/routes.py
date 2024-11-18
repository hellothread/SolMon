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
  