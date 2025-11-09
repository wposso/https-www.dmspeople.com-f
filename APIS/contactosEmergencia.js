document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1️⃣ Recuperar la sesión
        const sessionData = JSON.parse(localStorage.getItem("dms_user"));
        if (!sessionData || !sessionData.user) {
            window.location.href = "login.html";
            return;
        }

        const userId = sessionData.user.id; // el id del usuario autenticado

        // 2️⃣ Consumir el API de contactos
        const response = await fetch(`https://https-wwwdmspeoplecom-b-production.up.railway.app/api/contacts/${userId}`);
        if (!response.ok) throw new Error("Error al obtener contacto de emergencia");

        const result = await response.json();
        const data = result.data;

        if (!data) return;

        // 3️⃣ Llenar los campos del formulario
        const contactoInput = document.querySelector('input[type="text"][value="Willinton Posso"]');
        const telefonoInput = document.querySelector('input[type="tel"][value="3246357219"]');
        const parentescoSelect = document.querySelector("select");

        if (contactoInput) contactoInput.value = data.nombre_contacto || "";
        if (telefonoInput) telefonoInput.value = data.telefono || "";
        if (parentescoSelect) {
            const relacion = data.relacion?.toLowerCase() || "";
            Array.from(parentescoSelect.options).forEach(opt => {
                if (opt.textContent.toLowerCase().includes(relacion)) {
                    opt.selected = true;
                }
            });
        }

        // Si el API tiene dirección, también actualízala
        const direccionInput = document.querySelector('input[type="text"][value="Cra 49 b 107-99"]');
        if (direccionInput) direccionInput.value = data.direccion || "";

    } catch (err) {
        console.error("❌ Error al cargar contacto de emergencia:", err);
    }
});
