from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.routes import router
from utils.database import engine
import utils.models

app = FastAPI()

# 添加 CORS 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境建议设置具体域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头部
)

# 创建数据库表
utils.models.Base.metadata.create_all(bind=engine)

# 注册路由
app.include_router(router, prefix="/api") 