from flask import Flask, jsonify, request
from config import Config

# Importar Blueprints
from routes.clientes import clientes_bp
from routes.productos import productos_bp
from routes.pedidos import pedidos_bp
from routes.replicacion import replicacion_bp
from routes.health import health_bp

# Importar helpers
from utils.helpers import generar_reporte_nodo

app = Flask(__name__)

# CONFIGURACIÓN DE CORS
from flask_cors import CORS
app.url_map.strict_slashes = False

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuración
app.config['SECRET_KEY'] = Config.SECRET_KEY
app.config['JSON_SORT_KEYS'] = False

# Registrar Blueprints
app.register_blueprint(clientes_bp, url_prefix='/api/clientes')
app.register_blueprint(productos_bp, url_prefix='/api/productos')
app.register_blueprint(pedidos_bp, url_prefix='/api/pedidos')
app.register_blueprint(replicacion_bp, url_prefix='/api/replicacion')
app.register_blueprint(health_bp, url_prefix='/api/health')

@app.route('/')
def index():
    """Endpoint raíz con información del sistema"""
    return jsonify({
        'message': 'Sistema de Gestión de Pedidos - API v1.0',
        'status': 'running',
        'nodo': Config.NODO_ID,
        'puerto': Config.NODO_PORT,
        'replicacion_habilitada': Config.REPLICA_ENABLED
    })

@app.route('/api/info')
def info():
    """Información detallada del nodo"""
    return jsonify(generar_reporte_nodo())

@app.route('/api/status')
def status():
    """Estado del sistema"""
    from models import HealthCheck
    
    try:
        nodos = HealthCheck.obtener_nodos_activos()
        
        return jsonify({
            'success': True,
            'nodo_actual': Config.NODO_ID,
            'estado': 'activo',
            'nodos_activos': len(nodos),
            'base_datos': Config.DB_NAME,
            'host_db': Config.DB_HOST
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Manejo de errores 404"""
    return jsonify({
        'success': False,
        'error': 'Endpoint no encontrado'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Manejo de errores 500"""
    return jsonify({
        'success': False,
        'error': 'Error interno del servidor'
    }), 500

if __name__ == '__main__':
    print(f"""
    Sistema de Gestión de Pedidos               
    Nodo: {Config.NODO_ID:<38}
    Puerto: {Config.NODO_PORT:<36}
    Replicación: {'Habilitada' if Config.REPLICA_ENABLED else 'Deshabilitada':<33}
    """)
    
    app.run(
        debug=True, 
        host='0.0.0.0', 
        port=Config.NODO_PORT
    )