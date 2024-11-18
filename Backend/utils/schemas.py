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