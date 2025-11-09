// =======================================================
// ===== MENÚ USUARIO & SESIÓN ===========================
// =======================================================

const userInfo = document.getElementById("user-info");
const userMenu = document.getElementById("user-menu");
const logoutBtn = document.getElementById("logout");
const updateProfileBtn = document.getElementById("update-profile");

userInfo.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
});

window.addEventListener("click", () => (userMenu.style.display = "none"));

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("dms_user");
    window.location.href = "login.html";
});

updateProfileBtn.addEventListener("click", () => {
    window.location.href = "actualizarDatos.html";
});

// =======================================================
// ===== CARGAR DATOS DEL USUARIO DESDE LA API ===========
// =======================================================

async function cargarDatosDashboard() {
    const session = JSON.parse(localStorage.getItem("dms_user"));
    const userId = session?.user?.id;

    if (!userId) {
        console.warn("⚠️ No hay sesión activa");
        window.location.href = "login.html";
        return;
    }

    const url = `https://https-wwwdmspeoplecom-b-production.up.railway.app/api/infouser/${userId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al consultar la API");

        const { data } = await response.json();

        // ===== Asignar datos al header =====
        const name = data.nombre || "Usuario";
        const role = data.cargo || "Empleado";

        document.getElementById("user-name").textContent = name;
        document.getElementById("user-role").textContent = role;
        document.getElementById("welcome-title").textContent = `Bienvenido, ${name}`;

        // ===== Avatar con iniciales =====
        const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
        document.getElementById("user-avatar").textContent = initials;

    } catch (error) {
        console.error("❌ Error al cargar datos del dashboard:", error);
        alert("Error al cargar la información del usuario.");
    }
}

// ===== Ejecutar al cargar =====
window.addEventListener("DOMContentLoaded", cargarDatosDashboard);
