from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class WalletBase(BaseModel):
    name: str
    address: str
    note: Optional[str] = None

class WalletCreate(WalletBase):
    pass

class WalletUpdate(BaseModel):
    name: Optional[str] = None
    note: Optional[str] = None

class Wallet(WalletBase):
    id: int

    class Config:
        from_attributes = True

class BatchImportResponse(BaseModel):
    success: List[Wallet]
    errors: List[str]
    total_success: int
    total_errors: int 

# Token相关
class TokenBase(BaseModel):
    symbol: str
    name: str
    contract_address: str
    decimals: int
    current_price: Optional[float] = None

class TokenCreate(TokenBase):
    pass

class Token(TokenBase):
    id: int
    price_updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Transaction相关
class TransactionBase(BaseModel):
    tx_hash: str
    amount: float
    tx_type: str
    quantity: float
    timestamp: datetime

class TransactionCreate(TransactionBase):
    wallet_id: int
    token_id: int

class Transaction(TransactionBase):
    id: int
    wallet_id: int
    token_id: int
    wallet: Wallet
    token: Token

    class Config:
        from_attributes = True

# TokenHolding相关
class TokenHoldingBase(BaseModel):
    balance: float
    last_updated: datetime

class TokenHoldingCreate(TokenHoldingBase):
    wallet_id: int
    token_id: int

class TokenHolding(TokenHoldingBase):
    id: int
    wallet_id: int
    token_id: int
    token: Token

    class Config:
        from_attributes = True 

# 分页响应模型
class PaginatedResponse(BaseModel):
    items: List[Transaction]
    total: int
    page: int
    size: int
    total_pages: int

    class Config:
        from_attributes = True 


        