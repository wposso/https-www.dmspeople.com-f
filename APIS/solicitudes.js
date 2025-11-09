// =======================================================
// 🧾 CARGAR SOLICITUDES DEL USUARIO
// =======================================================
async function cargarSolicitudes() {
    const session = JSON.parse(localStorage.getItem("dms_user"));
    const userId = session?.user?.id;

    if (!userId) {
        console.error("❌ No se encontró el ID del usuario en localStorage.");
        return;
    }

    const url = `https://https-wwwdmspeoplecom-b-production.up.railway.app/api/request/${userId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al consultar la API");

        const { data } = await response.json();

        if (!data) {
            console.warn("⚠️ No hay solicitudes para este usuario.");
            return;
        }

        // Elemento donde se insertarán las solicitudes
        const tbody = document.querySelector(".solicitudes-table tbody");
        tbody.innerHTML = ""; // limpiar contenido anterior

        // Convertir los datos del backend en filas de la tabla
        const solicitudes = Array.isArray(data) ? data : [data]; // soporta array o único objeto

        solicitudes.forEach((sol) => {
            // Formatear fechas
            const fechaInicio = sol.fecha_inicio ? formatearFecha(sol.fecha_inicio) : "";
            const fechaFin = sol.fecha_fin ? ` - ${formatearFecha(sol.fecha_fin)}` : "";
            const fecha = fechaInicio + fechaFin;

            // Clases según estado
            let estadoClass = "";
            switch (sol.estado) {
                case "Aprobado":
                    estadoClass = "status-approved";
                    break;
                case "Pendiente":
                    estadoClass = "status-pending";
                    break;
                case "Rechazado":
                    estadoClass = "status-rejected";
                    break;
                default:
                    estadoClass = "status-pending";
            }

            // Crear fila
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${sol.tipo}</td>
        <td>${fecha}</td>
        <td><span class="status ${estadoClass}">${sol.estado}</span></td>
        <td><button class="action-btn">Ver</button></td>
      `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Error cargando solicitudes:", error);
    }
}

// Utilidad: convertir fecha ISO a DD/MM/YYYY
function formatearFecha(fecha) {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-CO");
}

// Ejecutar cuando la página cargue
window.addEventListener("DOMContentLoaded", cargarSolicitudes);
