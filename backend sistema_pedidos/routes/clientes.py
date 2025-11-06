from flask import Blueprint, request, jsonify
from models import Cliente

clientes_bp = Blueprint('clientes', __name__)

# IMPORTANTE: Agregar after_request
@clientes_bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@clientes_bp.route('/', methods=['POST'])
def crear_cliente():
    """Crear un nuevo cliente"""
    data = request.json
    
    try:
        cliente_id = Cliente.crear(
            data['nombre'],
            data['email'],
            data.get('telefono'),
            data.get('direccion')
        )
        return jsonify({
            'success': True,
            'cliente_id': cliente_id,
            'message': 'Cliente creado exitosamente'
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@clientes_bp.route('/', methods=['GET'])
def obtener_clientes():
    """Obtener todos los clientes"""
    try:
        clientes = Cliente.obtener_todos()
        return jsonify({
            'success': True,
            'clientes': clientes
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@clientes_bp.route('/<int:cliente_id>', methods=['GET'])
def obtener_cliente(cliente_id):
    """Obtener un cliente por ID"""
    try:
        cliente = Cliente.obtener_por_id(cliente_id)
        if not cliente:
            return jsonify({
                'success': False,
                'error': 'Cliente no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'cliente': cliente
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@clientes_bp.route('/<int:cliente_id>', methods=['PUT'])
def actualizar_cliente(cliente_id):
    """Actualizar un cliente"""
    data = request.json
    
    try:
        Cliente.actualizar(
            cliente_id,
            data.get('nombre'),
            data.get('email'),
            data.get('telefono'),
            data.get('direccion')
        )
        return jsonify({
            'success': True,
            'message': 'Cliente actualizado exitosamente'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@clientes_bp.route('/<int:cliente_id>', methods=['DELETE'])
def eliminar_cliente(cliente_id):
    """Eliminar un cliente"""
    try:
        Cliente.eliminar(cliente_id)
        return jsonify({
            'success': True,
            'message': 'Cliente eliminado exitosamente'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400