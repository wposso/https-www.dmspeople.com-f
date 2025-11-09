// =======================================================
// 🧾 MÓDULO DE VACACIONES - PORTAL DMS PEOPLE
// =======================================================

// === CONFIGURACIÓN ===
const API_URL = "https://https-wwwdmspeoplecom-b-production.up.railway.app/api/infouser/";
const historialTabla = document.getElementById("historial");

// === AL CARGAR LA PÁGINA ===
window.addEventListener("DOMContentLoaded", async () => {
    await cargarDatosUsuarioYVacaciones();
});

// =======================================================
// === CARGAR DATOS DEL USUARIO Y CALCULAR VACACIONES ====
// =======================================================
async function cargarDatosUsuarioYVacaciones() {
    const raw = localStorage.getItem("dms_user");
    if (!raw) {
        console.warn("⚠️ No hay sesión activa en localStorage");
        return;
    }

    const session = JSON.parse(raw);
    const userId =
        session.user?.id || session.user?.usuario_id || session.id || 4; // fallback demo

    try {
        const res = await fetch(`${API_URL}${userId}`);
        if (!res.ok) throw new Error("No se pudo obtener información del usuario");

        const { data } = await res.json();

        // Mostrar nombre y cargo en el header
        document.querySelector(".user-details strong").textContent = data.nombre;
        document.querySelector(".user-details span").textContent = data.cargo;
        document.querySelector(".user-avatar").textContent = obtenerIniciales(data.nombre);

        // === Cálculo de días disponibles ===
        const calculo = calcularVacacionesColombia(data.fecha_inicio);
        mostrarInformacionVacaciones(calculo);

        console.log("✅ Datos cargados correctamente:", calculo);
    } catch (error) {
        console.error("❌ Error al cargar usuario:", error);
    }
}

// =======================================================
// === CÁLCULO DE VACACIONES SEGÚN LEY COLOMBIANA ========
// =======================================================
/**
 * Según la legislación laboral colombiana:
 * - Un trabajador tiene derecho a 15 días hábiles de vacaciones por cada año trabajado.
 * - Si ha trabajado menos de un año, se calcula proporcionalmente.
 */
function calcularVacacionesColombia(fechaInicio) {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);

    // Calcular diferencia en días totales
    const diffDias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
    const anios = diffDias / 365;

    // Días de vacaciones proporcionales
    const diasGanados = anios * 15;

    // Simular días tomados (podrías obtenerlos de un endpoint real)
    const diasTomados = 5; // Ejemplo estático
    const diasDisponibles = Math.max(0, Math.floor(diasGanados - diasTomados));

    // Calcular tiempo total trabajado
    const tiempoLaborado = calcularTiempoLaborado(inicio, hoy);

    // Generar una conclusión basada en el tiempo
    let conclusion = "";
    if (anios < 1) {
        conclusion = `Aún no cumple un año completo (${tiempoLaborado}), por tanto tiene ${diasDisponibles} días proporcionales disponibles.`;
    } else if (anios >= 1 && anios < 3) {
        conclusion = `Con ${tiempoLaborado}, acumula ${Math.floor(diasGanados)} días de vacaciones según la ley.`;
    } else {
        conclusion = `Con ${tiempoLaborado}, ya cuenta con más de 3 años de antigüedad y ${Math.floor(diasDisponibles)} días hábiles disponibles.`;
    }

    return {
        fechaInicio: inicio,
        diasGanados: Math.floor(diasGanados),
        diasTomados,
        diasDisponibles,
        tiempoLaborado,
        conclusion,
    };
}

// =======================================================
// === MOSTRAR DATOS EN PANTALLA =========================
// =======================================================
function mostrarInformacionVacaciones(info) {
    document.querySelector(".vacation-info .green").textContent = info.diasDisponibles;
    document.querySelector(".vacation-info .orange").textContent = info.diasTomados;

    const proxima = document.querySelector(".vacation-info p:not(.green):not(.orange)");
    proxima.textContent = calcularProximaVacacion(info.fechaInicio);

    mostrarModal("Resumen Vacacional", info.conclusion);
}

// =======================================================
// === FUNCIONES DE APOYO ================================
// =======================================================
function calcularTiempoLaborado(inicio, hoy) {
    const años = hoy.getFullYear() - inicio.getFullYear();
    const meses = hoy.getMonth() - inicio.getMonth();
    const totalMeses = años * 12 + meses;
    const aniosExactos = Math.floor(totalMeses / 12);
    const mesesRestantes = totalMeses % 12;
    return `${aniosExactos} año(s) y ${mesesRestantes} mes(es)`;
}

function calcularProximaVacacion(fechaInicio) {
    const fecha = new Date(fechaInicio);
    fecha.setFullYear(fecha.getFullYear() + 1);
    return fecha.toLocaleDateString("es-CO");
}

function obtenerIniciales(nombre) {
    return nombre
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

// =======================================================
// === MODAL DE ALERTA ==================================
// =======================================================
function mostrarModal(titulo, mensaje) {
    document.getElementById("modal-title").innerText = titulo;
    document.getElementById("modal-message").innerText = mensaje;
    document.getElementById("modal-alert").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal-alert").style.display = "none";
}
