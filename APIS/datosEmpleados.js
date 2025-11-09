// ===== MENÚ DESPLEGABLE USUARIO =====
const userInfo = document.getElementById("user-info");
const userMenu = document.getElementById("user-menu");

userInfo.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
});
window.addEventListener("click", () => (userMenu.style.display = "none"));

// ===== CERRAR SESIÓN =====
function cerrarSesion() {
    localStorage.removeItem("dms_user");
    window.location.href = "login.html";
}

// ===== ALERTA VISUAL =====
const form = document.getElementById("updateForm");
const alertBox = document.getElementById("alert-box");

function mostrarAlerta(mensaje, tipo) {
    alertBox.textContent = mensaje;
    alertBox.className = `alert-box ${tipo}`;
    alertBox.style.display = "block";
    setTimeout(() => {
        alertBox.style.opacity = "0";
        setTimeout(() => {
            alertBox.style.display = "none";
            alertBox.style.opacity = "1";
        }, 300);
    }, 3000);
}

// ===== GUARDAR CAMBIOS =====
form.addEventListener("submit", (e) => {
    e.preventDefault();
    mostrarAlerta("✅ Cambios guardados correctamente.", "success");
});

// ===== CONFIRMACIÓN DE CANCELACIÓN =====
const confirmModal = document.getElementById("confirm-modal");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");

function cancelarCambios() {
    confirmModal.style.display = "flex";
}

confirmYes.addEventListener("click", () => {
    confirmModal.style.display = "none";
    mostrarAlerta("❌ Cambios cancelados.", "cancel");
    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 2000);
});

confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
});

// =======================================================
// ===== CARGAR DATOS DEL USUARIO DESDE LA API ===========
// =======================================================

async function cargarDatosUsuario() {
    const session = JSON.parse(localStorage.getItem('dms_user'));
    const userId = session?.user?.id;
    const url = `https://https-wwwdmspeoplecom-b-production.up.railway.app/api/infouser/${userId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al consultar la API");

        const { data } = await response.json();

        // 🔹 Mapeo entre los campos del front y las claves del API
        const mapping = {
            "Nombre completo": data.nombre,
            "Tipo de documento": data.tipo_documento,
            "Número de documento": data.numero_documento,
            "Lugar de expedición": data.expedicion ? formatearFecha(data.expedicion) : "",
            "Cargo": data.cargo,
            "Fecha de inicio laboral": data.fecha_inicio ? formatearFecha(data.fecha_inicio) : "",
            "Tipo de contrato": data.tipo_contrato,
            "Correo corporativo": data.correo_corporativo,
            "Dirección": data.direccion,
            "Correo electrónico personal": data.correo_personal,
            "Teléfono": data.celular,
        };

        // 🔹 Llenar los inputs que tengan esa etiqueta en el HTML
        document.querySelectorAll(".form-group").forEach((group) => {
            const label = group.querySelector("label");
            const input = group.querySelector("input, select");
            if (label && input && mapping[label.textContent.trim()] !== undefined) {
                input.value = mapping[label.textContent.trim()] || "";
            }
        });

        // 🔹 Mostrar el nombre y cargo en el encabezado
        const userNameLabel = document.querySelector(".user-details strong");
        const userRoleLabel = document.querySelector(".user-details span");
        const userAvatar = document.getElementById("user-avatar");

        if (userNameLabel) userNameLabel.textContent = data.nombre || "Usuario";
        if (userRoleLabel) userRoleLabel.textContent = data.cargo || "Empleado";
        if (userAvatar && data.nombre) {
            const initials = data.nombre.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
            userAvatar.textContent = initials;
        }

    } catch (error) {
        console.error("❌ Error cargando datos del usuario:", error);
        mostrarAlerta("Error al cargar la información del usuario.", "cancel");
    }
}

// ===== Utilidad para formatear fechas a YYYY-MM-DD =====
function formatearFecha(fecha) {
    if (!fecha) return "";
    const d = new Date(fecha);
    return d.toISOString().split("T")[0];
}

// ===== Ejecutar al cargar la página =====
window.addEventListener("DOMContentLoaded", cargarDatosUsuario);
