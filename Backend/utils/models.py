from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Wallet(Base):
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String, unique=True, index=True)
    note = Column(String, nullable=True)

    # 关联
    transactions = relationship("Transaction", back_populates="wallet")
    token_holdings = relationship("TokenHolding", back_populates="wallet")

class Token(Base):
    __tablename__ = "tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)  # 代币符号
    name = Column(String)  # 代币名称
    contract_address = Column(String, unique=True)  # 合约地址
    decimals = Column(Integer)  # 精度
    current_price = Column(Float)  # 当前价格
    price_updated_at = Column(DateTime)  # 价格更新时间

    # 关联
    transactions = relationship("Transaction", back_populates="token")
    holdings = relationship("TokenHolding", back_populates="token")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    token_id = Column(Integer, ForeignKey("tokens.id"))
    tx_hash = Column(String, unique=True)  # 交易哈希
    amount = Column(Float)  # 交易金额
    tx_type = Column(String)  # 'buy' 或 'sell'
    quantity = Column(Float)  # 代币数量
    timestamp = Column(DateTime)  # 交易时间

    # 关联
    wallet = relationship("Wallet", back_populates="transactions")
    token = relationship("Token", back_populates="transactions")

class TokenHolding(Base):
    __tablename__ = "token_holdings"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    token_id = Column(Integer, ForeignKey("tokens.id"))
    balance = Column(Float)  # 持仓数量
    last_updated = Column(DateTime)  # 最后更新时间
    
    # 关联
    wallet = relationship("Wallet", back_populates="token_holdings")
    token = relationship("Token", back_populates="holdings")