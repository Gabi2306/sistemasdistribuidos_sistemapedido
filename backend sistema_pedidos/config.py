import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'clave-secreta-sistema-pedidos-2025')
    
    # Configuración de Base de Datos
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'sistema_pedidos')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    
    # Configuración de Nodo
    NODO_ID = os.getenv('NODO_ID', 'nodo1')
    NODO_PORT = int(os.getenv('NODO_PORT', 5000))
    
    # Configuración de Replicación
    REPLICA_ENABLED = os.getenv('REPLICA_ENABLED', 'true').lower() == 'true'
    NODOS_REPLICAS = os.getenv('NODOS_REPLICAS', 'http://localhost:5001,http://localhost:5002').split(',')
    
    # Timeouts y Reintentos
    HEALTH_CHECK_INTERVAL = 30  # segundos
    REPLICATION_TIMEOUT = 5  # segundos
    MAX_RETRIES = 3