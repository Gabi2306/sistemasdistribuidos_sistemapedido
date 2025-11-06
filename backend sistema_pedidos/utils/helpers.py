import requests
from config import Config
import json
from datetime import datetime

def replicar_operacion(tabla, operacion, id_registro, datos):
    """
    Replica una operación a todos los nodos configurados
    """
    if not Config.REPLICA_ENABLED:
        return
    
    log_data = {
        'tabla_afectada': tabla,
        'operacion': operacion,
        'id_registro': id_registro,
        'datos_json': json.dumps(datos),
        'nodo_origen': Config.NODO_ID,
        'fecha_operacion': datetime.now().isoformat()
    }
    
    for nodo_url in Config.NODOS_REPLICAS:
        try:
            requests.post(
                f"{nodo_url}/api/replicacion/sincronizar",
                json={'logs': [log_data]},
                timeout=Config.REPLICATION_TIMEOUT
            )
        except Exception as e:
            print(f"Error replicando a {nodo_url}: {str(e)}")


def verificar_nodo_disponible(nodo_url):
    """
    Verifica si un nodo está disponible
    """
    try:
        response = requests.get(
            f"{nodo_url}/api/health/ping",
            timeout=3
        )
        return response.status_code == 200
    except:
        return False


def obtener_nodo_disponible():
    """
    Retorna el primer nodo disponible de las réplicas
    Si ninguno está disponible, retorna None
    """
    for nodo_url in Config.NODOS_REPLICAS:
        if verificar_nodo_disponible(nodo_url):
            return nodo_url
    return None


def balancear_carga():
    """
    Implementa un balanceo de carga simple (Round Robin)
    Retorna la URL del nodo a usar
    """
    nodos_activos = []
    
    for nodo_url in Config.NODOS_REPLICAS:
        if verificar_nodo_disponible(nodo_url):
            nodos_activos.append(nodo_url)
    
    if not nodos_activos:
        return None
    
    # Simple round robin - en producción se usaría algo más sofisticado
    import random
    return random.choice(nodos_activos)


def sincronizar_base_datos():
    """
    Sincroniza la base de datos local con otros nodos
    """
    from models import LogReplicacion
    
    try:
        logs = LogReplicacion.obtener_pendientes()
        
        if not logs:
            return {'success': True, 'message': 'No hay logs pendientes'}
        
        resultados = []
        
        for nodo_url in Config.NODOS_REPLICAS:
            try:
                response = requests.post(
                    f"{nodo_url}/api/replicacion/sincronizar",
                    json={'logs': logs},
                    timeout=Config.REPLICATION_TIMEOUT
                )
                
                if response.status_code == 200:
                    resultados.append({
                        'nodo': nodo_url,
                        'status': 'success'
                    })
                    
            except Exception as e:
                resultados.append({
                    'nodo': nodo_url,
                    'status': 'error',
                    'error': str(e)
                })
        
        # Marcar como replicados
        for log in logs:
            LogReplicacion.marcar_replicado(log['id_log'])
        
        return {
            'success': True,
            'logs_procesados': len(logs),
            'resultados': resultados
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def calcular_estadisticas_pedidos():
    """
    Calcula estadísticas básicas de pedidos
    """
    from models import Pedido
    from database import execute_query
    
    try:
        # Total de pedidos
        query_total = "SELECT COUNT(*) as total FROM pedidos"
        total = execute_query(query_total, fetch_one=True)
        
        # Pedidos por estado
        query_estados = """
            SELECT estado, COUNT(*) as cantidad 
            FROM pedidos 
            GROUP BY estado
        """
        por_estado = execute_query(query_estados, fetch_all=True)
        
        # Total facturado
        query_facturacion = "SELECT SUM(total) as total_facturado FROM pedidos"
        facturacion = execute_query(query_facturacion, fetch_one=True)
        
        # Pedidos por nodo
        query_nodos = """
            SELECT nodo_procesado, COUNT(*) as cantidad 
            FROM pedidos 
            GROUP BY nodo_procesado
        """
        por_nodo = execute_query(query_nodos, fetch_all=True)
        
        return {
            'success': True,
            'total_pedidos': total['total'],
            'por_estado': por_estado,
            'total_facturado': float(facturacion['total_facturado'] or 0),
            'por_nodo': por_nodo
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def validar_stock_productos(detalles):
    """
    Valida que haya stock suficiente para los productos del pedido
    """
    from models import Producto
    
    for detalle in detalles:
        producto = Producto.obtener_por_id(detalle['id_producto'])
        
        if not producto:
            return {
                'valido': False,
                'error': f'Producto {detalle["id_producto"]} no encontrado'
            }
        
        if producto['stock'] < detalle['cantidad']:
            return {
                'valido': False,
                'error': f'Stock insuficiente para {producto["nombre"]}. Disponible: {producto["stock"]}, Requerido: {detalle["cantidad"]}'
            }
    
    return {'valido': True}


def generar_reporte_nodo():
    """
    Genera un reporte del estado actual del nodo
    """
    from models import HealthCheck
    
    try:
        nodos = HealthCheck.obtener_nodos_activos()
        estadisticas = calcular_estadisticas_pedidos()
        
        return {
            'success': True,
            'nodo_actual': Config.NODO_ID,
            'puerto': Config.NODO_PORT,
            'replicacion_habilitada': Config.REPLICA_ENABLED,
            'nodos_configurados': len(Config.NODOS_REPLICAS),
            'nodos_activos': len(nodos),
            'estadisticas': estadisticas
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }