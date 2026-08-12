const SUPABASE_URL = "https://vhjdwyrpecoscgpirhcc.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_m5a12648_BCUTj8tnPdtfQ_bOjLlbgE";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function buscarProducto() {

    const codigo = document
        .getElementById("codigo")
        .value
        .trim();

    if (!codigo) return;

    const { data, error } = await supabaseClient.rpc(
        "buscar_producto_por_codigo",
        {
            codigo: codigo
        }
    );

    const resultado = document.getElementById("resultado");

    if (error) {
        console.error(error);
        resultado.innerHTML = "Error consultando producto";
        return;
    }

    if (!data || data.length === 0) {
        resultado.innerHTML = "Producto no encontrado";
        return;
    }

    const producto = data[0];

    resultado.innerHTML = `
        <strong>${producto.descripcion}</strong><br><br>

        Código: ${producto.codigo_barra}<br>
        Talla: ${producto.talla}<br>
        Color: ${producto.color}<br>
        Precio: $${producto.precio_con_iva.toLocaleString("es-CL")}<br>
        Stock: ${producto.stock}
    `;

    document.getElementById("codigo").value = "";
    document.getElementById("codigo").focus();
}
document
    .getElementById("codigo")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            buscarProducto();
        }

    });
