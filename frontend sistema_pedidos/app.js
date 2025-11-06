// Configuración de la API
const API_URL = 'http://localhost:5000/api';
let clientesGlobal = [];
let productosGlobal = [];
let pedidosGlobal = [];

// FUNCIONES DE NAVEGACIÓN

function showScreen(screenId) {
    document.querySelectorAll('.auth-screen, #mainScreen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.getElementById(screenId).style.display = screenId === 'mainScreen' ? 'block' : 'flex';
    
    if (screenId === 'mainScreen') {
        cargarDatosIniciales();
    }
}

// CARGAR DATOS INICIALES

async function cargarDatosIniciales() {
    await Promise.all([
        cargarClientes(),
        cargarProductos(),
        cargarPedidos(),
        verificarNodos()
    ]);
    actualizarEstadisticas();
}

// CLIENTES

async function cargarClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes`);
        const data = await response.json();
        
        if (data.success) {
            clientesGlobal = data.clientes;
            mostrarClientes(data.clientes);
            actualizarSelectClientes(data.clientes);
        }
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        mostrarError('Error al cargar clientes');
    }
}

function mostrarClientes(clientes) {
    const lista = document.getElementById('listaClientes');
    
    if (clientes.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No hay clientes registrados</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = clientes.map(cliente => `
        <div class="device-item fade-in">
            <div class="device-info">
                <h6><i class="fas fa-user me-2"></i>${cliente.nombre}</h6>
                <small><i class="fas fa-envelope me-1"></i>${cliente.email}</small><br>
                <small><i class="fas fa-phone me-1"></i>${cliente.telefono || 'N/A'}</small>
            </div>
            <div class="device-actions">
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente(${cliente.id_cliente})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function crearCliente() {
    const nombre = document.getElementById('clienteNombre').value;
    const email = document.getElementById('clienteEmail').value;
    const telefono = document.getElementById('clienteTelefono').value;
    const direccion = document.getElementById('clienteDireccion').value;
    
    if (!nombre || !email) {
        mostrarError('Por favor complete los campos obligatorios');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/clientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, telefono, direccion })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito('Cliente creado exitosamente');
            bootstrap.Modal.getInstance(document.getElementById('nuevoClienteModal')).hide();
            document.getElementById('formNuevoCliente').reset();
            cargarClientes();
        } else {
            mostrarError(data.error || 'Error al crear cliente');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al crear cliente');
    }
}

async function eliminarCliente(id) {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    
    try {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito('Cliente eliminado exitosamente');
            cargarClientes();
        } else {
            mostrarError(data.error || 'Error al eliminar cliente');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar cliente');
    }
}

function actualizarSelectClientes(clientes) {
    const select = document.getElementById('pedidoCliente');
    select.innerHTML = '<option value="">Seleccione un cliente</option>' +
        clientes.map(c => `<option value="${c.id_cliente}">${c.nombre}</option>`).join('');
}

// PRODUCTOS

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const data = await response.json();
        
        if (data.success) {
            productosGlobal = data.productos;
            mostrarProductos(data.productos);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarError('Error al cargar productos');
    }
}

function mostrarProductos(productos) {
    const lista = document.getElementById('listaProductos');
    
    if (productos.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box"></i>
                <p>No hay productos registrados</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = productos.map(producto => `
        <div class="device-item fade-in">
            <div class="device-info">
                <h6><i class="fas fa-box me-2"></i>${producto.nombre}</h6>
                <small>${producto.descripcion || 'Sin descripción'}</small><br>
                <small><strong>Precio:</strong> $${parseFloat(producto.precio).toLocaleString()}</small>
                <small class="ms-3"><strong>Stock:</strong> ${producto.stock}</small>
            </div>
            <div class="device-actions">
                <span class="badge ${producto.stock > 0 ? 'bg-success' : 'bg-danger'}">
                    ${producto.stock > 0 ? 'Disponible' : 'Agotado'}
                </span>
            </div>
        </div>
    `).join('');
}

async function crearProducto() {
    const nombre = document.getElementById('productoNombre').value;
    const descripcion = document.getElementById('productoDescripcion').value;
    const precio = document.getElementById('productoPrecio').value;
    const stock = document.getElementById('productoStock').value;
    
    if (!nombre || !precio || !stock) {
        mostrarError('Por favor complete los campos obligatorios');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion, precio: parseFloat(precio), stock: parseInt(stock) })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito('Producto creado exitosamente');
            bootstrap.Modal.getInstance(document.getElementById('nuevoProductoModal')).hide();
            document.getElementById('formNuevoProducto').reset();
            cargarProductos();
        } else {
            mostrarError(data.error || 'Error al crear producto');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al crear producto');
    }
}

// PEDIDOS

async function cargarPedidos() {
    try {
        const response = await fetch(`${API_URL}/pedidos`);
        const data = await response.json();
        
        if (data.success) {
            pedidosGlobal = data.pedidos;
            mostrarPedidos(data.pedidos);
        }
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        mostrarError('Error al cargar pedidos');
    }
}

function mostrarPedidos(pedidos) {
    const lista = document.getElementById('listaPedidos');
    
    if (pedidos.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <p>No hay pedidos registrados</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = pedidos.map(pedido => {
        const estadoClass = {
            'pendiente': 'warning',
            'en_proceso': 'info',
            'enviado': 'primary',
            'entregado': 'success',
            'cancelado': 'danger'
        }[pedido.estado] || 'secondary';
        
        const fecha = new Date(pedido.fecha_pedido).toLocaleDateString('es-ES');
        
        return `
            <div class="alert-item nivel-1 fade-in">
                <div class="alert-header">
                    <div>
                        <span class="alert-type">
                            <i class="fas fa-shopping-bag me-2"></i>Pedido #${pedido.id_pedido}
                        </span>
                        <span class="badge bg-${estadoClass} ms-2">${pedido.estado.replace('_', ' ')}</span>
                    </div>
                    <span class="alert-time">${fecha}</span>
                </div>
                <div class="alert-message">
                    <strong>Cliente:</strong> ${pedido.nombre_cliente}<br>
                    <strong>Total:</strong> $${parseFloat(pedido.total).toLocaleString()}<br>
                    <small class="text-muted"><i class="fas fa-server me-1"></i>Procesado por: ${pedido.nodo_procesado}</small>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="verDetallePedido(${pedido.id_pedido})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="cambiarEstadoPedido(${pedido.id_pedido}, '${pedido.estado}')">
                        <i class="fas fa-edit"></i> Estado
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarPedido(${pedido.id_pedido})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function agregarProductoAlPedido() {
    const contenedor = document.getElementById('productosDelPedido');
    const index = contenedor.children.length;
    
    const html = `
        <div class="row mb-2 producto-pedido-item" data-index="${index}">
            <div class="col-6">
                <select class="form-select form-select-sm producto-select" required onchange="actualizarPrecioProducto(${index})">
                    <option value="">Seleccione producto</option>
                    ${productosGlobal.map(p => `
                        <option value="${p.id_producto}" data-precio="${p.precio}" data-stock="${p.stock}">
                            ${p.nombre} (Stock: ${p.stock})
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="col-3">
                <input type="number" class="form-control form-control-sm cantidad-input" placeholder="Cant" min="1" required onchange="calcularTotalPedido()">
            </div>
            <div class="col-2">
                <input type="number" class="form-control form-control-sm precio-input" placeholder="Precio" readonly>
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarProductoPedido(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    contenedor.insertAdjacentHTML('beforeend', html);
}

function actualizarPrecioProducto(index) {
    const items = document.querySelectorAll('.producto-pedido-item');
    const item = items[index];
    const select = item.querySelector('.producto-select');
    const precioInput = item.querySelector('.precio-input');
    const cantidadInput = item.querySelector('.cantidad-input');
    
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption.value) {
        const precio = selectedOption.dataset.precio;
        const stock = parseInt(selectedOption.dataset.stock);
        precioInput.value = precio;
        cantidadInput.max = stock;
        calcularTotalPedido();
    }
}

function eliminarProductoPedido(index) {
    const items = document.querySelectorAll('.producto-pedido-item');
    items[index].remove();
    calcularTotalPedido();
}

function calcularTotalPedido() {
    let total = 0;
    const items = document.querySelectorAll('.producto-pedido-item');
    
    items.forEach(item => {
        const cantidad = parseFloat(item.querySelector('.cantidad-input').value) || 0;
        const precio = parseFloat(item.querySelector('.precio-input').value) || 0;
        total += cantidad * precio;
    });
    
    document.getElementById('totalPedido').textContent = total.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

async function crearPedido() {
    const cliente_id = document.getElementById('pedidoCliente').value;
    const direccion_envio = document.getElementById('pedidoDireccion').value;
    
    if (!cliente_id || !direccion_envio) {
        mostrarError('Por favor complete todos los campos');
        return;
    }
    
    const items = document.querySelectorAll('.producto-pedido-item');
    
    if (items.length === 0) {
        mostrarError('Debe agregar al menos un producto');
        return;
    }
    
    const detalles = [];
    
    for (let item of items) {
        const select = item.querySelector('.producto-select');
        const cantidad = parseInt(item.querySelector('.cantidad-input').value);
        const precio = parseFloat(item.querySelector('.precio-input').value);
        
        if (!select.value || !cantidad || !precio) {
            mostrarError('Complete todos los productos agregados');
            return;
        }
        
        const stock = parseInt(select.options[select.selectedIndex].dataset.stock);
        if (cantidad > stock) {
            mostrarError(`Stock insuficiente para ${select.options[select.selectedIndex].text}`);
            return;
        }
        
        detalles.push({
            id_producto: parseInt(select.value),
            cantidad: cantidad,
            precio_unitario: precio
        });
    }
    
    try {
        const response = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente_id: parseInt(cliente_id),
                direccion_envio,
                detalles
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito(`Pedido #${data.pedido_id} creado exitosamente en ${data.nodo_procesado}`);
            bootstrap.Modal.getInstance(document.getElementById('nuevoPedidoModal')).hide();
            document.getElementById('formNuevoPedido').reset();
            document.getElementById('productosDelPedido').innerHTML = '';
            document.getElementById('totalPedido').textContent = '0.00';
            cargarPedidos();
            cargarProductos(); // Actualizar stock
        } else {
            mostrarError(data.error || 'Error al crear pedido');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al crear pedido');
    }
}

async function verDetallePedido(id) {
    try {
        const response = await fetch(`${API_URL}/pedidos/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const pedido = data.pedido;
            let detallesHTML = pedido.detalles.map(d => `
                <tr>
                    <td>${d.nombre_producto}</td>
                    <td>${d.cantidad}</td>
                    <td>$${parseFloat(d.precio_unitario).toLocaleString()}</td>
                    <td>$${parseFloat(d.subtotal).toLocaleString()}</td>
                </tr>
            `).join('');
            
            alert(`
PEDIDO #${pedido.id_pedido}
Cliente: ${pedido.nombre_cliente}
Estado: ${pedido.estado}
Total: $${parseFloat(pedido.total).toLocaleString()}
Nodo: ${pedido.nodo_procesado}

PRODUCTOS:
${pedido.detalles.map(d => `- ${d.nombre_producto} x${d.cantidad} = $${parseFloat(d.subtotal).toLocaleString()}`).join('\n')}
            `);
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al obtener detalles del pedido');
    }
}

async function cambiarEstadoPedido(id, estadoActual) {
    const estados = ['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado'];
    const nuevoEstado = prompt(`Estado actual: ${estadoActual}\n\nNuevos estados disponibles:\n${estados.join(', ')}\n\nIngrese el nuevo estado:`);
    
    if (!nuevoEstado || !estados.includes(nuevoEstado)) {
        mostrarError('Estado no válido');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito('Estado actualizado exitosamente');
            cargarPedidos();
        } else {
            mostrarError(data.error || 'Error al actualizar estado');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar estado');
    }
}

async function eliminarPedido(id) {
    if (!confirm('¿Está seguro de eliminar este pedido?')) return;
    
    try {
        const response = await fetch(`${API_URL}/pedidos/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito('Pedido eliminado exitosamente');
            cargarPedidos();
        } else {
            mostrarError(data.error || 'Error al eliminar pedido');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar pedido');
    }
}

// SISTEMA Y NODOS

async function verificarNodos() {
    try {
        const response = await fetch(`${API_URL}/health/verificar-replicas`);
        const data = await response.json();
        
        if (data.success) {
            const nodosActivos = data.replicas.filter(r => r.estado === 'activo').length + 1; // +1 por el nodo actual
            document.getElementById('nodosActivos').textContent = nodosActivos;
            document.getElementById('nodoActual').textContent = data.nodo_actual;
            
            mostrarEstadoNodos(data.replicas, data.nodo_actual);
        }
    } catch (error) {
        console.error('Error al verificar nodos:', error);
    }
}

function mostrarEstadoNodos(replicas, nodoActual) {
    const contenedor = document.getElementById('estadoNodos');
    
    let html = `
        <div class="zone-item" style="border-left: 4px solid #28a745;">
            <div class="zone-info">
                <h6><i class="fas fa-server me-2"></i>${nodoActual} (ACTUAL)</h6>
                <small class="text-success">Estado: ACTIVO</small>
            </div>
            <span class="badge bg-success">
                <i class="fas fa-check-circle"></i>
            </span>
        </div>
    `;
    
    replicas.forEach(replica => {
        const color = replica.estado === 'activo' ? '#28a745' : '#dc3545';
        const badgeClass = replica.estado === 'activo' ? 'success' : 'danger';
        const icon = replica.estado === 'activo' ? 'check-circle' : 'times-circle';
        
        html += `
            <div class="zone-item" style="border-left: 4px solid ${color};">
                <div class="zone-info">
                    <h6><i class="fas fa-server me-2"></i>${replica.nodo || replica.url}</h6>
                    <small class="text-${badgeClass}">Estado: ${replica.estado.toUpperCase()}</small>
                </div>
                <span class="badge bg-${badgeClass}">
                    <i class="fas fa-${icon}"></i>
                </span>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
}

async function ejecutarReplicacion() {
    try {
        const response = await fetch(`${API_URL}/replicacion/replicar`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito(`Replicación completada: ${data.logs_replicados} logs procesados`);
            mostrarEstadoReplicacion(data.resultados);
        } else {
            mostrarError(data.message || 'Error en la replicación');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al ejecutar replicación');
    }
}

function mostrarEstadoReplicacion(resultados) {
    const contenedor = document.getElementById('estadoReplicacion');
    
    if (!resultados || resultados.length === 0) {
        contenedor.innerHTML = '<small class="text-muted">No hay resultados de replicación</small>';
        return;
    }
    
    const html = resultados.map(r => `
        <div class="alert alert-${r.status === 'success' ? 'success' : 'danger'} alert-sm mt-2">
            <small><strong>${r.nodo}:</strong> ${r.status.toUpperCase()}</small>
            ${r.error ? `<br><small>${r.error}</small>` : ''}
        </div>
    `).join('');
    
    contenedor.innerHTML = html;
}

// ESTADÍSTICAS

function actualizarEstadisticas() {
    document.getElementById('totalPedidos').textContent = pedidosGlobal.length;
    document.getElementById('totalClientes').textContent = clientesGlobal.length;
    document.getElementById('totalProductos').textContent = productosGlobal.length;
}

// MENSAJES

function mostrarExito(mensaje) {
    alert('' + mensaje);
}

function mostrarError(mensaje) {
    alert('' + mensaje);
}

// INICIALIZACIÓN

// Cargar datos cuando se abre el modal de nuevo pedido
document.getElementById('nuevoPedidoModal')?.addEventListener('show.bs.modal', function () {
    if (productosGlobal.length === 0) {
        cargarProductos();
    }
});

// Auto-refresh cada 30 segundos
setInterval(() => {
    if (document.getElementById('mainScreen').style.display === 'block') {
        cargarPedidos();
        verificarNodos();
    }
}, 30000);