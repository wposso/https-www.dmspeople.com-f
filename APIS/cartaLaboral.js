// =======================================================
// ===== CARGAR DATOS DEL USUARIO DESDE LOCALSTORAGE =====
// =======================================================

async function cargarDatosCarta() {
    const session = JSON.parse(localStorage.getItem('dms_user'));
    const userId = session?.user?.id;
    const url = `https://https-wwwdmspeoplecom-b-production.up.railway.app/api/infouser/${userId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al consultar la API");

        const { data } = await response.json();

        // ===== Mapeo entre los labels del formulario y los datos del API =====
        const mapping = {
            "Nombre completo": data.nombre,
            "Tipo de documento": data.tipo_documento,
            "Número de documento": data.numero_documento,
            "Fecha de inicio laboral": formatearFecha(data.fecha_inicio),
            "Tipo de contrato": data.tipo_contrato,
            "Cargo": data.cargo,
        };

        // ===== Llenar los campos del formulario =====
        document.querySelectorAll(".form-group").forEach((group) => {
            const label = group.querySelector("label");
            const input = group.querySelector("input, select");
            if (label && input && mapping[label.textContent.trim()] !== undefined) {
                input.value = mapping[label.textContent.trim()] || "";
            }
        });

    } catch (error) {
        console.error("❌ Error cargando datos de la carta:", error);
        alert("Error al cargar los datos del usuario. Ver consola.");
    }
}

// ===== Utilidad para formatear fechas a YYYY-MM-DD =====
function formatearFecha(fecha) {
    if (!fecha) return "";
    const d = new Date(fecha);
    return d.toISOString().split("T")[0];
}

// ===== Ejecutar al cargar la página =====
window.addEventListener("DOMContentLoaded", cargarDatosCarta);

// =======================================================
// ====== CARGAR NOMBRE Y CARGO DEL USUARIO (ROBUSTO) ====
// =======================================================

async function cargarHeaderUsuarioRobusto() {
    const raw = localStorage.getItem("dms_user");
    if (!raw) {
        console.warn("⚠️ No hay dms_user en localStorage");
        return;
    }

    let session;
    try {
        session = JSON.parse(raw);
    } catch (err) {
        console.error("❌ Error parseando dms_user:", err);
        return;
    }

    const userObj = session.user || session || {};
    const userId = userObj.id || userObj.usuario_id || session.id || session.usuario_id;

    // Intentar obtener el nombre desde localStorage primero
    let name =
        userObj.nombre ||
        userObj.nombreCompleto ||
        userObj.name ||
        userObj.fullName ||
        session.nombre ||
        "";

    // Intentar obtener el cargo/rol desde localStorage
    let role =
        userObj.rol ||
        userObj.role ||
        userObj.cargo ||
        userObj.tipo ||
        session.rol ||
        "";

    // === Si falta el nombre o el cargo, obtener desde la API ===
    if ((!name || name === "") || (!role || role === "Empleado")) {
        try {
            const res = await fetch(`https-wwwdmspeoplecom-b-production.up.railway.app/api/infouser/${userId}`);
            if (res.ok) {
                const { data } = await res.json();

                // Tomar los valores reales del API
                name = data.nombre || name;
                role = data.cargo || role || "Empleado";

                // Actualizar localStorage para futuras cargas
                const updatedSession = {
                    ...session,
                    user: {
                        ...(session.user || {}),
                        nombre: data.nombre,
                        cargo: data.cargo,
                        rol: role,
                    },
                };
                localStorage.setItem("dms_user", JSON.stringify(updatedSession));

                console.log("✅ Datos actualizados desde API y guardados en localStorage");
            } else {
                console.warn("⚠️ No se pudo obtener datos desde la API");
            }
        } catch (error) {
            console.error("❌ Error al consultar infouser:", error);
        }
    }

    // === Actualizar el DOM con nombre y cargo ===
    const avatarEl = document.querySelector(".user-avatar");
    const nameEl = document.querySelector(".user-details strong");
    const roleEl = document.querySelector(".user-details span");

    if (nameEl) nameEl.textContent = name || "Usuario";
    if (roleEl) roleEl.textContent = role || "Empleado";

    // Generar iniciales
    if (avatarEl) {
        const initials =
            (name || "U")
                .split(" ")
                .filter(Boolean)
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "US";
        avatarEl.textContent = initials;
    }

    console.log("Header cargado con:", { userId, name, role });
}

window.addEventListener("DOMContentLoaded", cargarHeaderUsuarioRobusto);
