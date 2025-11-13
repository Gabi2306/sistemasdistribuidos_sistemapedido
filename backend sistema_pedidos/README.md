# Sistema Distribuido de Gestión de Pedidos

Sistema web distribuido tolerante a fallos para la gestión de pedidos de e-commerce.

Características

-Arquitectura distribuida con múltiples nodos
-Tolerancia a fallos mediante replicación
-API REST completa (CRUD)
-Health check entre nodos
-Gestión de estados de pedidos
-Control de stock automático

## Requisitos

- Python 3.8+
- MySQL 5.7+
- pip

## Instalación

1. **Clonar el repositorio**
```bash
git clone <repositorio>
cd sistema-pedidos
```

2. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

3. **Crear la base de datos**
```bash
mysql -u root -p < database.sql
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

## Ejecución

### Ejecutar Nodo 1 (Puerto 5000)
```bash
python app.py
```

### Ejecutar Nodo 2 (Puerto 5001)
```bash
# Copiar archivo de configuración 
cp .env.nodo2 .env
python app.py
```

python -m http.server 5500

## Endpoints Principales

### Clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes` - Obtener todos
- `GET /api/clientes/<id>` - Obtener por ID
- `PUT /api/clientes/<id>` - Actualizar
- `DELETE /api/clientes/<id>` - Eliminar

### Productos
- `POST /api/productos` - Crear producto
- `GET /api/productos` - Obtener todos
- `GET /api/productos/<id>` - Obtener por ID
- `PUT /api/productos/<id>` - Actualizar

### Pedidos
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos` - Obtener todos
- `GET /api/pedidos/<id>` - Obtener por ID
- `PUT /api/pedidos/<id>/estado` - Actualizar estado
- `DELETE /api/pedidos/<id>` - Eliminar

### Health Check
- `GET /api/health` - Estado del nodo
- `GET /api/health/nodos` - Nodos activos
- `GET /api/health/ping` - Ping simple

### Replicación
- `GET /api/replicacion/logs/pendientes` - Logs pendientes
- `POST /api/replicacion/replicar` - Replicar a nodos

## Pruebas de Tolerancia a Fallos

1. Iniciar ambos nodos
2. Crear un pedido en nodo1
3. Detener nodo1
4. Verificar que nodo2 sigue funcionando
5. Crear pedido en nodo2
6. Reiniciar nodo1
7. Verificar sincronización

## Equipo

- Doris Arzuaga
- Gabriela Zabaleta
- Jesus Egea
- Diego Luna