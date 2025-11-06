import pymysql
from config import Config

def get_db_connection():
    """Obtiene una conexión a la base de datos"""
    return pymysql.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        port=Config.DB_PORT,
        cursorclass=pymysql.cursors.DictCursor
    )

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    """Ejecuta una query y retorna resultados según el tipo"""
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            
            if fetch_one:
                return cursor.fetchone()
            elif fetch_all:
                return cursor.fetchall()
            else:
                connection.commit()
                return cursor.lastrowid
    finally:
        connection.close()

def execute_transaction(queries_with_params):
    """Ejecuta múltiples queries en una transacción"""
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            for query, params in queries_with_params:
                cursor.execute(query, params or ())
            connection.commit()
            return True
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()