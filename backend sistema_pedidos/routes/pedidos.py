from flask import Blueprint, request, jsonify
from models import Pedido, Producto, Cliente
from config import Config

pedidos_bp = Blueprint('pedidos', __name__)

# IMPORTANTE: Agregar after_request para TODOS los responses
@pedidos_bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@pedidos_bp.route('/', methods=['POST'])
def crear_pedido():
    """Crear un nuevo pedido"""
    data = request.json
    
    try:
        # Validar que el cliente existe
        cliente = Cliente.obtener_por_id(data['cliente_id'])
        if not cliente:
            return jsonify({
                'success': False,
                'error': 'Cliente no encontrado'
            }), 404
        
        # Validar productos y stock
        for detalle in data['detalles']:
            producto = Producto.obtener_por_id(detalle['id_producto'])
            if not producto:
                return jsonify({
                    'success': False,
                    'error': f'Producto {detalle["id_producto"]} no encontrado'
                }), 404
            
            if producto['stock'] < detalle['cantidad']:
                return jsonify({
                    'success': False,
                    'error': f'Stock insuficiente para {producto["nombre"]}'
                }), 400
        
        # Crear el pedido
        pedido_id = Pedido.crear(
            data['cliente_id'],
            data['direccion_envio'],
            data['detalles']
        )
        
        return jsonify({
            'success': True,
            'pedido_id': pedido_id,
            'nodo_procesado': Config.NODO_ID,
            'message': 'Pedido creado exitosamente'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@pedidos_bp.route('/', methods=['GET'])
def obtener_pedidos():
    """Obtener todos los pedidos"""
    try:
        limit = request.args.get('limit', 100, type=int)
        pedidos = Pedido.obtener_todos(limit)
        return jsonify({
            'success': True,
            'pedidos': pedidos,
            'nodo_actual': Config.NODO_ID
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@pedidos_bp.route('/<int:pedido_id>', methods=['GET'])
def obtener_pedido(pedido_id):
    """Obtener un pedido por ID con sus detalles"""
    try:
        pedido = Pedido.obtener_por_id(pedido_id)
        if not pedido:
            return jsonify({
                'success': False,
                'error': 'Pedido no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'pedido': pedido
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@pedidos_bp.route('/cliente/<int:cliente_id>', methods=['GET'])
def obtener_pedidos_cliente(cliente_id):
    """Obtener todos los pedidos de un cliente"""
    try:
        pedidos = Pedido.obtener_por_cliente(cliente_id)
        return jsonify({
            'success': True,
            'pedidos': pedidos
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@pedidos_bp.route('/<int:pedido_id>/estado', methods=['PUT'])
def actualizar_estado_pedido(pedido_id):
    """Actualizar el estado de un pedido"""
    data = request.json
    
    estados_validos = ['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado']
    
    if data.get('estado') not in estados_validos:
        return jsonify({
            'success': False,
            'error': 'Estado no válido'
        }), 400
    
    try:
        Pedido.actualizar_estado(pedido_id, data['estado'])
        return jsonify({
            'success': True,
            'message': 'Estado actualizado exitosamente'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@pedidos_bp.route('/<int:pedido_id>', methods=['DELETE'])
def eliminar_pedido(pedido_id):
    """Eliminar un pedido"""
    try:
        Pedido.eliminar(pedido_id)
        return jsonify({
            'success': True,
            'message': 'Pedido eliminado exitosamente'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400