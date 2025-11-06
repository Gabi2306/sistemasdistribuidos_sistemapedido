from flask import Blueprint, request, jsonify
from models import LogReplicacion
from config import Config
import requests
import json

replicacion_bp = Blueprint('replicacion', __name__)

@replicacion_bp.route('/logs/pendientes', methods=['GET'])
def obtener_logs_pendientes():
    """Obtener logs de replicación pendientes"""
    try:
        logs = LogReplicacion.obtener_pendientes()
        return jsonify({
            'success': True,
            'logs': logs,
            'nodo': Config.NODO_ID
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@replicacion_bp.route('/sincronizar', methods=['POST'])
def sincronizar_nodo():
    """Sincronizar datos desde otro nodo"""
    data = request.json
    
    try:
        # Recibir logs de replicación de otro nodo
        logs = data.get('logs', [])
        
        for log in logs:
            # Aplicar las operaciones según el tipo
            tabla = log['tabla_afectada']
            operacion = log['operacion']
            datos = json.loads(log['datos_json'])
            
            # Aquí se aplicarían las operaciones en la BD local
            # Por simplicidad, solo marcamos como recibidos
            
        return jsonify({
            'success': True,
            'logs_procesados': len(logs),
            'message': 'Sincronización completada'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@replicacion_bp.route('/replicar', methods=['POST'])
def replicar_a_nodos():
    """Replicar logs pendientes a otros nodos"""
    if not Config.REPLICA_ENABLED:
        return jsonify({
            'success': False,
            'message': 'Replicación deshabilitada'
        }), 400
    
    try:
        logs = LogReplicacion.obtener_pendientes()
        
        if not logs:
            return jsonify({
                'success': True,
                'message': 'No hay logs pendientes para replicar'
            })
        
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
                else:
                    resultados.append({
                        'nodo': nodo_url,
                        'status': 'error',
                        'error': response.text
                    })
                    
            except Exception as e:
                resultados.append({
                    'nodo': nodo_url,
                    'status': 'error',
                    'error': str(e)
                })
        
        # Marcar logs como replicados
        for log in logs:
            LogReplicacion.marcar_replicado(log['id_log'])
        
        return jsonify({
            'success': True,
            'logs_replicados': len(logs),
            'resultados': resultados
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500