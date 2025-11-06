from flask import Blueprint, request, jsonify
from models import HealthCheck
from config import Config
import requests

health_bp = Blueprint('health', __name__)

@health_bp.route('/', methods=['GET'])
def health_check():
    """Endpoint de health check"""
    try:
        # Actualizar estado de este nodo
        HealthCheck.actualizar_estado(Config.NODO_ID, 'activo')
        
        return jsonify({
            'success': True,
            'nodo': Config.NODO_ID,
            'estado': 'activo',
            'puerto': Config.NODO_PORT
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@health_bp.route('/nodos', methods=['GET'])
def obtener_nodos():
    """Obtener estado de todos los nodos"""
    try:
        nodos = HealthCheck.obtener_nodos_activos()
        return jsonify({
            'success': True,
            'nodos': nodos,
            'total_activos': len(nodos)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@health_bp.route('/ping', methods=['GET'])
def ping():
    """Endpoint simple para verificar si el servidor está activo"""
    return jsonify({
        'success': True,
        'message': 'pong',
        'nodo': Config.NODO_ID
    })

@health_bp.route('/verificar-replicas', methods=['GET'])
def verificar_replicas():
    """Verificar estado de los nodos réplica"""
    resultados = []
    
    for nodo_url in Config.NODOS_REPLICAS:
        try:
            response = requests.get(
                f"{nodo_url}/api/health/ping",
                timeout=3
            )
            
            if response.status_code == 200:
                data = response.json()
                resultados.append({
                    'url': nodo_url,
                    'estado': 'activo',
                    'nodo': data.get('nodo', 'desconocido')
                })
            else:
                resultados.append({
                    'url': nodo_url,
                    'estado': 'error',
                    'mensaje': 'Respuesta inválida'
                })
                
        except Exception as e:
            resultados.append({
                'url': nodo_url,
                'estado': 'inactivo',
                'error': str(e)
            })
    
    return jsonify({
        'success': True,
        'replicas': resultados,
        'nodo_actual': Config.NODO_ID
    })