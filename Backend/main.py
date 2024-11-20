from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.routes import router
from utils.database import engine, SessionLocal
from utils.monitor import run_monitor
import utils.models
import asyncio
import uvicorn
from contextlib import asynccontextmanager

async def start_monitor():
    """启动监控任务"""
    db = SessionLocal()
    try:
        await run_monitor(db)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 在后台启动监控任务
    monitor_task = asyncio.create_task(start_monitor())
    yield
    # 关闭监控任务
    monitor_task.cancel()
    try:
        await monitor_task
    except asyncio.CancelledError:
        pass

app = FastAPI(lifespan=lifespan)

# 添加 CORS 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建数据库表
utils.models.Base.metadata.create_all(bind=engine)

# 注册路由
app.include_router(router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

