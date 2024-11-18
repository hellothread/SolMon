from sqlalchemy.orm import Session
from . import models, schemas
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

