from flask import Blueprint, request, jsonify
from models import Producto

productos_bp = Blueprint('productos', __name__)

# IMPORTANTE: Agregar after_request
@productos_bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@productos_bp.route('/', methods=['POST'])
def crear_producto():
    """Crear un nuevo producto"""
    data = request.json
    
    try:
        producto_id = Producto.crear(
            data['nombre'],
            data.get('descripcion', ''),
            data['precio'],
            data.get('stock', 0)
        )
        return jsonify({
            'success': True,
            'producto_id': producto_id,
            'message': 'Producto creado exitosamente'
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@productos_bp.route('/', methods=['GET'])
def obtener_productos():
    """Obtener todos los productos activos"""
    try:
        productos = Producto.obtener_todos()
        return jsonify({
            'success': True,
            'productos': productos
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@productos_bp.route('/<int:producto_id>', methods=['GET'])
def obtener_producto(producto_id):
    """Obtener un producto por ID"""
    try:
        producto = Producto.obtener_por_id(producto_id)
        if not producto:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'producto': producto
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@productos_bp.route('/<int:producto_id>', methods=['PUT'])
def actualizar_producto(producto_id):
    """Actualizar un producto"""
    data = request.json
    
    try:
        Producto.actualizar(
            producto_id,
            data.get('nombre'),
            data.get('descripcion'),
            data.get('precio'),
            data.get('stock')
        )
        return jsonify({
            'success': True,
            'message': 'Producto actualizado exitosamente'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400