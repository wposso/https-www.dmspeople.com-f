// =======================================================
// 💼 COMPROBANTE DE NÓMINA - PORTAL DMS PEOPLE
// =======================================================

const API_URL = "https://https-wwwdmspeoplecom-b-production.up.railway.app/api/infouser/";

// Al cargar la página
window.addEventListener("DOMContentLoaded", async () => {
    await generarComprobanteNomina();
});

// =======================================================
// === FUNCIÓN PRINCIPAL =================================
// =======================================================
async function generarComprobanteNomina() {
    const raw = localStorage.getItem("dms_user");
    if (!raw) {
        console.error("⚠️ No se encontró sesión activa en localStorage");
        return;
    }

    const session = JSON.parse(raw);
    const userId =
        session.user?.id || session.user?.usuario_id || session.id || 4; // fallback demo

    try {
        const res = await fetch(`${API_URL}${userId}`);
        if (!res.ok) throw new Error("No se pudo obtener la información del usuario");

        const { data } = await res.json();

        // === Cálculos de nómina ===
        const nomina = calcularNomina(data);

        // === Llenar los datos del HTML ===
        llenarPlantillaNomina(data, nomina);

    } catch (error) {
        console.error("❌ Error generando comprobante de nómina:", error);
    }
}

// =======================================================
// === CÁLCULO DE NÓMINA =================================
// =======================================================
/**
 * Este cálculo usa valores simulados aproximados:
 * - Basado en el cargo, define un salario base estimado.
 * - Aplica descuentos estándar (salud 4%, pensión 4%, retención 5% si aplica).
 * - Auxilio de transporte solo si el salario <= 2 SMMLV (2025 = $1.300.000 aprox).
 */
function calcularNomina(empleado) {
    const SALARIO_MINIMO_2025 = 1300000;

    // === Sueldo base simulado según cargo ===
    const cargo = empleado.cargo?.toLowerCase() || "";
    let sueldoBasico = 0;

    if (cargo.includes("asistente")) sueldoBasico = 2100000;
    else if (cargo.includes("analista")) sueldoBasico = 2600000;
    else if (cargo.includes("supervisor")) sueldoBasico = 3200000;
    else if (cargo.includes("gerente") || cargo.includes("jefe")) sueldoBasico = 5200000;
    else sueldoBasico = 1800000; // default

    // === Cálculo de auxilio transporte ===
    const auxilioTransporte = sueldoBasico <= 2 * SALARIO_MINIMO_2025 ? 162000 : 0;

    // === Descuentos obligatorios ===
    const salud = Math.round(sueldoBasico * 0.04);
    const pension = Math.round(sueldoBasico * 0.04);
    const retencion = sueldoBasico > 4000000 ? Math.round(sueldoBasico * 0.05) : 0;

    // === Totales ===
    const totalIngresos = sueldoBasico + auxilioTransporte;
    const totalDescuentos = salud + pension + retencion;
    const netoPagar = totalIngresos - totalDescuentos;

    // === Período actual ===
    const fechaActual = new Date();
    const mes = fechaActual.toLocaleString("es-CO", { month: "long" });
    const anio = fechaActual.getFullYear();
    const quincena = fechaActual.getDate() <= 15 ? "Primera" : "Segunda";

    return {
        sueldoBasico,
        auxilioTransporte,
        salud,
        pension,
        retencion,
        totalIngresos,
        totalDescuentos,
        netoPagar,
        fechaActual: fechaActual.toLocaleDateString("es-CO"),
        periodo: `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${anio}`,
        quincena,
        jefe: "Diego Ramírez",
        cargoJefe: "Administrador de Nómina"
    };
}

// =======================================================
// === RELLENAR PLANTILLA HTML ===========================
// =======================================================
function llenarPlantillaNomina(data, nomina) {
    document.body.innerHTML = document.body.innerHTML
        .replace(/{{fechaActual}}/g, nomina.fechaActual)
        .replace(/{{nombreEmpleado}}/g, data.nombre)
        .replace(/{{documento}}/g, data.numero_documento)
        .replace(/{{cargo}}/g, data.cargo)
        .replace(/{{tipoContrato}}/g, data.tipo_contrato)
        .replace(/{{periodo}}/g, nomina.periodo)
        .replace(/{{quincena}}/g, nomina.quincena)
        .replace(/{{sueldoBasico}}/g, formatoMoneda(nomina.sueldoBasico))
        .replace(/{{auxilioTransporte}}/g, formatoMoneda(nomina.auxilioTransporte))
        .replace(/{{salud}}/g, formatoMoneda(nomina.salud))
        .replace(/{{pension}}/g, formatoMoneda(nomina.pension))
        .replace(/{{retencion}}/g, formatoMoneda(nomina.retencion))
        .replace(/{{totalIngresos}}/g, formatoMoneda(nomina.totalIngresos))
        .replace(/{{totalDescuentos}}/g, formatoMoneda(nomina.totalDescuentos))
        .replace(/{{netoPagar}}/g, formatoMoneda(nomina.netoPagar))
        .replace(/{{nombreJefe}}/g, nomina.jefe)
        .replace(/{{cargoJefe}}/g, nomina.cargoJefe);

    // Mostrar automáticamente el botón para descargar PDF
    crearBotonDescarga();
}

// =======================================================
// === UTILIDADES ========================================
// =======================================================
function formatoMoneda(valor) {
    return valor.toLocaleString("es-CO");
}

// function crearBotonDescarga() {
//     const boton = document.createElement("button");
//     boton.textContent = "📄 Descargar Comprobante PDF";
//     boton.className = "btn-descargar";
//     boton.style.margin = "20px auto";
//     boton.style.display = "block";
//     boton.style.padding = "10px 20px";
//     boton.style.background = "#0050a0";
//     boton.style.color = "white";
//     boton.style.border = "none";
//     boton.style.borderRadius = "6px";
//     boton.style.cursor = "pointer";

//     boton.addEventListener("click", generarPDF);
//     document.body.appendChild(boton);
// }
