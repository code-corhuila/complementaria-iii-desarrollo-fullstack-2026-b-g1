import { createApi } from './api.js';

const API_URL = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || 'http://localhost:3000';
const api = createApi({ baseUrl: API_URL });

const $ = (selector) => document.querySelector(selector);

const loginView = $('#login-view');
const dataView = $('#data-view');
const loginForm = $('#login-form');
const loginError = $('#login-error');
const dataError = $('#data-error');
const tableBody = $('#cursos-body');
const welcome = $('#welcome');
const submitBtn = $('#login-btn');

function showLogin(message = '') {
  dataView.hidden = true;
  loginView.hidden = false;
  loginError.textContent = message;
  loginError.hidden = !message;
}

function renderCursos(data) {
  welcome.textContent = `Hola, ${data.usuario}. Tienes ${data.total} cursos.`;
  tableBody.replaceChildren(
    ...data.cursos.map((curso) => {
      const row = document.createElement('tr');
      [curso.id, curso.nombre, curso.docente, curso.creditos, curso.semestre].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value; // textContent evita inyección de HTML
        row.appendChild(cell);
      });
      return row;
    }),
  );
}

async function loadData() {
  dataError.hidden = true;
  try {
    const data = await api.getCursos();
    renderCursos(data);
    loginView.hidden = true;
    dataView.hidden = false;
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      showLogin('Tu sesión expiró. Inicia sesión de nuevo.');
    } else {
      dataError.textContent = error.message;
      dataError.hidden = false;
    }
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  submitBtn.disabled = true;
  try {
    await api.login($('#username').value.trim(), $('#password').value);
    loginForm.reset();
    await loadData();
  } catch (error) {
    showLogin(error.message);
  } finally {
    submitBtn.disabled = false;
  }
});

$('#logout-btn').addEventListener('click', () => {
  api.logout();
  showLogin();
});

$('#reload-btn').addEventListener('click', loadData);

// Si ya hay token guardado, intentamos cargar los datos directamente
if (api.isLoggedIn()) {
  loadData();
} else {
  showLogin();
}
