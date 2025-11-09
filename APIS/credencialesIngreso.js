// login.js

// --- Selectores UI ---
const form = document.getElementById('loginForm');
const inputUsuario = document.getElementById('usuario'); // aquí se espera el correo
const inputContrasena = document.getElementById('contrasena');
const loginErrorBox = document.getElementById('login-error');
const submitButton = form.querySelector('button[type="submit"]');

// --- URL de la API de usuarios ---
const USERS_API_URL = 'https://https-wwwdmspeoplecom-b-production.up.railway.app/api/usuarios';

// --- Helpers UI ---
function showError(msg) {
    loginErrorBox.textContent = msg;
    loginErrorBox.style.display = 'block';
}

function hideError() {
    loginErrorBox.textContent = '';
    loginErrorBox.style.display = 'none';
}

function setButtonLoading(isLoading) {
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = 'Verificando...';
    } else {
        submitButton.disabled = false;
        if (submitButton.dataset.originalText) {
            submitButton.textContent = submitButton.dataset.originalText;
        }
    }
}

// --- Fetch usuarios desde la API ---
async function fetchUsuarios() {
    const res = await fetch(USERS_API_URL, { method: 'GET' });
    if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(`Error al consultar usuarios: ${res.status} ${res.statusText} ${text || ''}`);
    }
    const json = await res.json();
    if (!json || !json.success || !Array.isArray(json.data)) {
        throw new Error('Respuesta inválida del servidor al obtener usuarios.');
    }
    return json.data;
}

// --- Autenticar credenciales contra la lista de usuarios ---
function findMatchingUser(users, correoInput, passInput) {
    const correo = correoInput.trim().toLowerCase();
    const password = passInput; // mantener case-sensitive para la contraseña

    return users.find(u => {
        // defensivamente comprobar que existan campos
        if (!u || !u.correo || u.contrasena === undefined) return false;
        return String(u.correo).trim().toLowerCase() === correo && String(u.contrasena) === String(password);
    }) || null;
}

// --- Guardar sesión en localStorage (sin guardar la contraseña) ---
function saveSession(user) {
    if (!user) return;
    // Clonar y eliminar la propiedad contrasena por seguridad
    const userSession = { ...user };
    if (userSession.contrasena) delete userSession.contrasena;

    // Añadir metadatos de sesión
    const sessionPayload = {
        user: userSession,
        loggedAt: new Date().toISOString()
    };

    localStorage.setItem('dms_user', JSON.stringify(sessionPayload));
}

// --- Manejador del login (ya ligado en tu HTML: onsubmit="handleLogin(event)") ---
async function handleLogin(event) {
    event.preventDefault();
    hideError();

    const correo = inputUsuario.value || '';
    const contrasena = inputContrasena.value || '';

    if (!correo.trim() || !contrasena) {
        showError('Por favor completa correo y contraseña.');
        return;
    }

    setButtonLoading(true);

    try {
        const usuarios = await fetchUsuarios();
        const matched = findMatchingUser(usuarios, correo, contrasena);

        if (!matched) {
            showError('Usuario o contraseña incorrectos. Verifica e intenta nuevamente.');
            setButtonLoading(false);
            return;
        }

        // Guardar sesión y redirigir
        saveSession(matched);

        // Opcional: pequeña pausa para UX, luego redirigir
        submitButton.textContent = 'Entrando...';
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 350);

    } catch (err) {
        console.error('Error en proceso de login:', err);
        showError('Error al conectar con el servidor. Intenta de nuevo más tarde.');
        setButtonLoading(false);
    }
}

// --- Atar el handler al form (por si tu HTML cambia) ---
if (form) {
    // si el form ya tiene onsubmit en el HTML, esto no rompe; evita doble envío
    form.addEventListener('submit', handleLogin);
}
