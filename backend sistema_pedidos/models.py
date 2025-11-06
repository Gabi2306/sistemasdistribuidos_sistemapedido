from database import execute_query, execute_transaction
from config import Config
import json
from datetime import datetime

class Cliente:
    @staticmethod
    def crear(nombre, email, telefono=None, direccion=None):
        query = "INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (%s, %s, %s, %s)"
        cliente_id = execute_query(query, (nombre, email, telefono, direccion))
        
        # Registrar en log de replicación
        LogReplicacion.registrar('clientes', 'INSERT', cliente_id, {
            'nombre': nombre, 'email': email, 'telefono': telefono, 'direccion': direccion
        })
        
        return cliente_id
    
    @staticmethod
    def obtener_por_id(cliente_id):
        query = "SELECT * FROM clientes WHERE id_cliente = %s"
        return execute_query(query, (cliente_id,), fetch_one=True)
    
    @staticmethod
    def obtener_todos():
        query = "SELECT * FROM clientes ORDER BY fecha_registro DESC"
        return execute_query(query, fetch_all=True)
    
    @staticmethod
    def actualizar(cliente_id, nombre=None, email=None, telefono=None, direccion=None):
        query = "UPDATE clientes SET nombre = %s, email = %s, telefono = %s, direccion = %s WHERE id_cliente = %s"
        execute_query(query, (nombre, email, telefono, direccion, cliente_id))
        
        LogReplicacion.registrar('clientes', 'UPDATE', cliente_id, {
            'nombre': nombre, 'email': email, 'telefono': telefono, 'direccion': direccion
        })
    
    @staticmethod
    def eliminar(cliente_id):
        query = "DELETE FROM clientes WHERE id_cliente = %s"
        execute_query(query, (cliente_id,))
        
        LogReplicacion.registrar('clientes', 'DELETE', cliente_id, {})


class Producto:
    @staticmethod
    def crear(nombre, descripcion, precio, stock=0):
        query = "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (%s, %s, %s, %s)"
        producto_id = execute_query(query, (nombre, descripcion, precio, stock))
        
        LogReplicacion.registrar('productos', 'INSERT', producto_id, {
            'nombre': nombre, 'descripcion': descripcion, 'precio': float(precio), 'stock': stock
        })
        
        return producto_id
    
    @staticmethod
    def obtener_por_id(producto_id):
        query = "SELECT * FROM productos WHERE id_producto = %s"
        return execute_query(query, (producto_id,), fetch_one=True)
    
    @staticmethod
    def obtener_todos():
        query = "SELECT * FROM productos WHERE estado = 'activo' ORDER BY nombre"
        return execute_query(query, fetch_all=True)
    
    @staticmethod
    def actualizar(producto_id, nombre=None, descripcion=None, precio=None, stock=None):
        query = "UPDATE productos SET nombre = %s, descripcion = %s, precio = %s, stock = %s WHERE id_producto = %s"
        execute_query(query, (nombre, descripcion, precio, stock, producto_id))
        
        LogReplicacion.registrar('productos', 'UPDATE', producto_id, {
            'nombre': nombre, 'descripcion': descripcion, 'precio': float(precio), 'stock': stock
        })
    
    @staticmethod
    def actualizar_stock(producto_id, cantidad):
        query = "UPDATE productos SET stock = stock + %s WHERE id_producto = %s"
        execute_query(query, (cantidad, producto_id))


class Pedido:
    @staticmethod
    def crear(cliente_id, direccion_envio, detalles):
        """
        detalles es una lista de diccionarios: 
        [{'id_producto': 1, 'cantidad': 2, 'precio_unitario': 100.00}, ...]
        """
        # Calcular total
        total = sum(d['cantidad'] * d['precio_unitario'] for d in detalles)
        
        # Insertar pedido
        query_pedido = """
            INSERT INTO pedidos (id_cliente, total, direccion_envio, nodo_procesado) 
            VALUES (%s, %s, %s, %s)
        """
        pedido_id = execute_query(query_pedido, (cliente_id, total, direccion_envio, Config.NODO_ID))
        
        # Insertar detalles del pedido
        for detalle in detalles:
            subtotal = detalle['cantidad'] * detalle['precio_unitario']
            query_detalle = """
                INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                VALUES (%s, %s, %s, %s, %s)
            """
            execute_query(query_detalle, (
                pedido_id, 
                detalle['id_producto'], 
                detalle['cantidad'], 
                detalle['precio_unitario'], 
                subtotal
            ))
            
            # Actualizar stock
            Producto.actualizar_stock(detalle['id_producto'], -detalle['cantidad'])
        
        # Registrar en log de replicación
        LogReplicacion.registrar('pedidos', 'INSERT', pedido_id, {
            'cliente_id': cliente_id,
            'total': float(total),
            'direccion_envio': direccion_envio,
            'detalles': detalles
        })
        
        return pedido_id
    
    @staticmethod
    def obtener_por_id(pedido_id):
        query = """
            SELECT p.*, c.nombre as nombre_cliente, c.email as email_cliente
            FROM pedidos p
            INNER JOIN clientes c ON p.id_cliente = c.id_cliente
            WHERE p.id_pedido = %s
        """
        pedido = execute_query(query, (pedido_id,), fetch_one=True)
        
        if pedido:
            # Obtener detalles del pedido
            query_detalles = """
                SELECT dp.*, pr.nombre as nombre_producto
                FROM detalle_pedidos dp
                INNER JOIN productos pr ON dp.id_producto = pr.id_producto
                WHERE dp.id_pedido = %s
            """
            pedido['detalles'] = execute_query(query_detalles, (pedido_id,), fetch_all=True)
        
        return pedido
    
    @staticmethod
    def obtener_todos(limit=100):
        query = """
            SELECT p.*, c.nombre as nombre_cliente
            FROM pedidos p
            INNER JOIN clientes c ON p.id_cliente = c.id_cliente
            ORDER BY p.fecha_pedido DESC
            LIMIT %s
        """
        return execute_query(query, (limit,), fetch_all=True)
    
    @staticmethod
    def obtener_por_cliente(cliente_id):
        query = """
            SELECT p.*, c.nombre as nombre_cliente
            FROM pedidos p
            INNER JOIN clientes c ON p.id_cliente = c.id_cliente
            WHERE p.id_cliente = %s
            ORDER BY p.fecha_pedido DESC
        """
        return execute_query(query, (cliente_id,), fetch_all=True)
    
    @staticmethod
    def actualizar_estado(pedido_id, nuevo_estado):
        query = "UPDATE pedidos SET estado = %s WHERE id_pedido = %s"
        execute_query(query, (nuevo_estado, pedido_id))
        
        LogReplicacion.registrar('pedidos', 'UPDATE', pedido_id, {
            'estado': nuevo_estado
        })
    
    @staticmethod
    def eliminar(pedido_id):
        query = "DELETE FROM pedidos WHERE id_pedido = %s"
        execute_query(query, (pedido_id,))
        
        LogReplicacion.registrar('pedidos', 'DELETE', pedido_id, {})


class LogReplicacion:
    @staticmethod
    def registrar(tabla, operacion, id_registro, datos):
        """Registra una operación para replicación"""
        if not Config.REPLICA_ENABLED:
            return
        
        query = """
            INSERT INTO log_replicacion 
            (tabla_afectada, operacion, id_registro, datos_json, nodo_origen)
            VALUES (%s, %s, %s, %s, %s)
        """
        datos_json = json.dumps(datos)
        execute_query(query, (tabla, operacion, id_registro, datos_json, Config.NODO_ID))
    
    @staticmethod
    def obtener_pendientes():
        """Obtiene logs no replicados"""
        query = """
            SELECT * FROM log_replicacion 
            WHERE replicado = FALSE AND nodo_origen = %s
            ORDER BY fecha_operacion ASC
        """
        return execute_query(query, (Config.NODO_ID,), fetch_all=True)
    
    @staticmethod
    def marcar_replicado(id_log):
        query = "UPDATE log_replicacion SET replicado = TRUE WHERE id_log = %s"
        execute_query(query, (id_log,))


class HealthCheck:
    @staticmethod
    def actualizar_estado(nodo, estado):
        """Actualiza o inserta el estado de un nodo"""
        query = """
            INSERT INTO health_check (nodo, estado, ultima_verificacion)
            VALUES (%s, %s, NOW())
            ON DUPLICATE KEY UPDATE estado = %s, ultima_verificacion = NOW()
        """
        execute_query(query, (nodo, estado, estado))
    
    @staticmethod
    def obtener_nodos_activos():
        """Obtiene todos los nodos activos"""
        query = """
            SELECT * FROM health_check 
            WHERE estado = 'activo' 
            AND ultima_verificacion > DATE_SUB(NOW(), INTERVAL 60 SECOND)
        """
        return execute_query(query, fetch_all=True)
    
    @staticmethod
    def obtener_estado_nodo(nodo):
        query = "SELECT * FROM health_check WHERE nodo = %s"
        return execute_query(query, (nodo,), fetch_one=True)