from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Wallet(Base):
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String, unique=True, index=True)
    note = Column(String, nullable=True)
    
    # 建立与交易记录的关系
    transactions = relationship("Transaction", back_populates="wallet")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    amount = Column(Float)
    tx_type = Column(String)  # 'buy' 或 'sell'
    token_symbol = Column(String)  # 币种符号
    quantity = Column(Float)
    timestamp = Column(DateTime)
    
    # 关联钱包
    wallet = relationship("Wallet", back_populates="transactions")  