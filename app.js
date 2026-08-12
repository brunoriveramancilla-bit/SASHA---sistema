const SUPABASE_URL = "https://vhjdwyrpecoscgpirhcc.supabase.co";
const SUPABASE_KEY = "sb_publishable_m5a12648_BCUTj8tnPdtfQ_bOjLlbgE";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let clienteActual = null;
let productoActual = null;
let pedidoActual = [];


// =====================================================
// NAVEGACION
// =====================================================

function mostrarSeccion(id) {

    document
        .querySelectorAll(".panel")
        .forEach(panel => panel.classList.add("oculto"));

    document
        .getElementById(id)
        .classList.remove("oculto");
}


function volverMenu() {

    document
        .querySelectorAll(".panel")
        .forEach(panel => panel.classList.add("oculto"));

    document
        .getElementById("menuPrincipal")
        .classList.remove("oculto");
}


// =====================================================
// BUSCAR CLIENTES
// =====================================================

const inputCliente = document.getElementById("buscarCliente");

if (inputCliente) {
    inputCliente.addEventListener("input", buscarClientes);
}


async function buscarClientes() {

    const texto = document
        .getElementById("buscarCliente")
        .value
        .trim();

    const lista = document.getElementById("listaClientes");

    if (texto.length < 1) {
        lista.style.display = "none";
        return;
    }

    const { data, error } = await supabaseClient
        .from("clientes")
        .select("*")
        .ilike("nombre", `%${texto}%`)
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    lista.innerHTML = "";

    data.forEach(cliente => {

        const div = document.createElement("div");

        div.className = "item-resultado";
        div.innerText = cliente.nombre;

        div.onclick = () => seleccionarCliente(cliente);

        lista.appendChild(div);
    });

    lista.style.display = "block";
}


function seleccionarCliente(cliente) {

    clienteActual = cliente;

    document.getElementById("buscarCliente").value = cliente.nombre;

    document.getElementById("clienteSeleccionado").innerHTML =
        `<strong>Cliente seleccionado:</strong> ${cliente.nombre}`;

    document.getElementById("listaClientes").style.display = "none";
}


// =====================================================
// BUSCAR PRODUCTOS
// =====================================================

const inputProducto = document.getElementById("buscarProducto");

if (inputProducto) {
    inputProducto.addEventListener("input", buscarProductos);
}


async function buscarProductos() {

    const texto = document
        .getElementById("buscarProducto")
        .value
        .trim();

    const lista = document.getElementById("listaProductos");

    if (texto.length < 1) {
        lista.style.display = "none";
        return;
    }

    const { data, error } = await supabaseClient
        .from("productos")
        .select("*")
        .or(
            `descripcion.ilike.%${texto}%,codigo_barra.ilike.%${texto}%`
        )
        .limit(15);

    if (error) {
        console.error(error);
        return;
    }

    lista.innerHTML = "";

    data.forEach(producto => {

        const div = document.createElement("div");

        div.className = "item-resultado";

        div.innerText =
            `${producto.descripcion} - ${producto.talla} - ${producto.color}`;

        div.onclick = () => seleccionarProducto(producto);

        lista.appendChild(div);
    });

    lista.style.display = "block";
}


// =====================================================
// SELECCION PRODUCTO
// =====================================================

async function seleccionarProducto(producto) {

    const { data, error } = await supabaseClient.rpc(
        "buscar_producto_por_codigo",
        {
            codigo: producto.codigo_barra
        }
    );

    if (error || !data || data.length === 0) {
        console.error(error);
        return;
    }

    productoActual = data[0];

    document.getElementById("nombreProducto").innerText =
        productoActual.descripcion;

    document.getElementById("tallaProducto").innerText =
        productoActual.talla || "-";

    document.getElementById("colorProducto").innerText =
        productoActual.color || "-";

    document.getElementById("precioProducto").innerText =
        "$" + productoActual.precio_con_iva.toLocaleString("es-CL");

    document.getElementById("stockProducto").innerText =
        productoActual.stock;

    document
        .getElementById("infoProducto")
        .classList.remove("oculto");

    document.getElementById("listaProductos").style.display = "none";
}


// =====================================================
// AGREGAR AL PEDIDO
// =====================================================

function agregarProductoPedido() {

    if (!productoActual) return;

    const cantidad = parseInt(
        document.getElementById("cantidadProducto").value
    );

    const stock = Number(productoActual.stock);

    const cantidadStock = Math.min(cantidad, stock);

    const cantidadPedir = Math.max(cantidad - stock, 0);

    pedidoActual.push({

        producto: productoActual,

        cantidad: cantidad,

        stock: cantidadStock,

        pedir: cantidadPedir

    });

    productoActual = null;

    document.getElementById("buscarProducto").value = "";
    document.getElementById("cantidadProducto").value = 1;

    document
        .getElementById("infoProducto")
        .classList.add("oculto");

    actualizarPedido();
}


// =====================================================
// ACTUALIZAR CARRITO
// =====================================================

function actualizarPedido() {

    const tbody = document.querySelector(
        "#tablaPedido tbody"
    );

    tbody.innerHTML = "";

    let total = 0;

    pedidoActual.forEach((item, index) => {

        const subtotal =
            item.producto.precio_con_iva * item.cantidad;

        total += subtotal;

        const fila = document.createElement("tr");

        fila.innerHTML = `

            <td>
                ${item.producto.descripcion}
                <br>
                <small>
                    ${item.producto.talla || ""}
                    ${item.producto.color || ""}
                </small>
            </td>

            <td>${item.cantidad}</td>

            <td>${item.stock}</td>

            <td>${item.pedir}</td>

            <td>
                $${subtotal.toLocaleString("es-CL")}
            </td>

            <td>
                <button onclick="eliminarProducto(${index})">
                    X
                </button>
            </td>
        `;

        tbody.appendChild(fila);
    });

    document.getElementById("totalPedido").innerText =
        "$" + total.toLocaleString("es-CL");
}


function eliminarProducto(index) {

    pedidoActual.splice(index, 1);

    actualizarPedido();
}


// =====================================================
// GUARDAR PEDIDO
// =====================================================

function guardarPedido() {

    if (!clienteActual) {
        alert("Debe seleccionar un cliente.");
        return;
    }

    if (pedidoActual.length === 0) {
        alert("Debe agregar productos.");
        return;
    }

    alert(
        "Pedido preparado correctamente. En el siguiente paso lo guardaremos en Supabase."
    );
}
