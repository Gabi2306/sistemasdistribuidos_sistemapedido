-- ============================================
-- CREACIÓN DE BASE DE DATOS
-- ============================================
CREATE DATABASE IF NOT EXISTS sistema_pedidos;
USE sistema_pedidos;

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo'
);

-- ============================================
-- TABLA: pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    total DECIMAL(10, 2) NOT NULL,
    direccion_envio TEXT NOT NULL,
    nodo_procesado VARCHAR(50) DEFAULT 'nodo1',
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);

-- ============================================
-- TABLA: detalle_pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- ============================================
-- TABLA: log_replicacion (Para tolerancia a fallos)
-- ============================================
CREATE TABLE IF NOT EXISTS log_replicacion (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    tabla_afectada VARCHAR(50) NOT NULL,
    operacion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    id_registro INT NOT NULL,
    datos_json TEXT,
    nodo_origen VARCHAR(50) NOT NULL,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    replicado BOOLEAN DEFAULT FALSE
);

-- ============================================
-- TABLA: health_check (Monitoreo de nodos)
-- ============================================
CREATE TABLE IF NOT EXISTS health_check (
    id_health INT AUTO_INCREMENT PRIMARY KEY,
    nodo VARCHAR(50) NOT NULL,
    estado ENUM('activo', 'inactivo', 'error') DEFAULT 'activo',
    ultima_verificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (nodo)
);