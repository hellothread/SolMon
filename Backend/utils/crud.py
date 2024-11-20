from sqlalchemy.orm import Session
from utils import models, schemas
from typing import List

def get_wallet(db: Session, wallet_id: int):
    return db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()

def get_wallet_by_address(db: Session, address: str):
    return db.query(models.Wallet).filter(models.Wallet.address == address).first()

def get_wallets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Wallet).offset(skip).limit(limit).all()

def create_wallet(db: Session, wallet: schemas.WalletCreate):

    db_wallet = models.Wallet(**wallet.dict())
    db.add(db_wallet)
    db.commit()
    db.refresh(db_wallet)
    return db_wallet

def create_transaction(db: Session, transaction_data: dict):
    db_transaction = models.Transaction(**transaction_data)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_wallet(db: Session, wallet_id: int):
    wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if wallet:
        db.delete(wallet)
        db.commit()
        return True
    return False

def update_wallet(db: Session, wallet_id: int, wallet: schemas.WalletUpdate):
    db_wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id)
    db_wallet.update(wallet.dict(exclude_unset=True))
    db.commit()
    return db_wallet.first() 

def batch_create_wallets(db: Session, wallets: List[schemas.WalletCreate]):
    result = []
    for wallet_data in wallets:
        db_wallet = models.Wallet(**wallet_data.dict())
        db.add(db_wallet)
        result.append(db_wallet)
    
    db.commit()
    for wallet in result:
        db.refresh(wallet)
    
    return result 

def get_monitoring_transactions(db: Session, skip: int = 0, limit: int = 20):
    """获取所有钱包的最新交易记录，按时间倒序排序"""
    # 获取总记录数
    total = db.query(models.Transaction).count()
    
    # 获取分页数据
    transactions = (db.query(models.Transaction)
            .join(models.Wallet)  # 关联钱包表
            .order_by(models.Transaction.timestamp.desc())  # 按时间倒序
            .offset(skip)
            .limit(limit)
            .all())
            
    return {
        "items": transactions,
        "total": total,
        "total_pages": (total + limit - 1) // limit  # 向上取整
    }

# 可选：获取交易总数
def get_monitoring_transactions_count(db: Session):
    """获取交易总数"""
    return db.query(models.Transaction).count()

def get_transaction_by_hash(db: Session, tx_hash: str):
    """根据交易哈希获取交易记录"""
    return db.query(models.Transaction).filter(models.Transaction.tx_hash == tx_hash).first()

def get_token_by_address(db: Session, contract_address: str):
    return db.query(models.Token).filter(models.Token.contract_address == contract_address).first()

def create_token(db: Session, token_data: dict):
    db_token = models.Token(**token_data)
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

