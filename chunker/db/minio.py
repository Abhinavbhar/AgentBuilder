from minio import Minio
import os
from dotenv import load_dotenv

# ================= CONFIG ===================
load_dotenv()  
def connect_minio():
    MINIO_SERVER =os.getenv("MINIO_SERVER") 
    MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
    MINIO_SECURE = os.getenv("MINIO_SECURE")
    print(MINIO_SECURE,"security")
    client = Minio(
        MINIO_SERVER,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=False
    )
    return client
