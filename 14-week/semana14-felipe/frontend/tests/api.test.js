// Pruebas del frontend (cliente de la API) con node:test.
// Se simulan fetch y localStorage, así no se necesita el backend ni un navegador.
// Ejecutar: npm test
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createApi, TOKEN_KEY } from '../public/js/api.js';

// localStorage falso en memoria
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

// fetch falso que registra las llamadas y responde lo que le digamos
function fakeFetch(status, body) {
  const calls = [];
  const fn = async (url, options = {}) => {
    calls.push({ url, options });
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  fn.calls = calls;
  return fn;
}

const baseUrl = 'http://api.test';

describe('login()', () => {
  test('guarda el token cuando las credenciales son correctas', async () => {
    const storage = fakeStorage();
    const fetchFn = fakeFetch(200, { token: 'abc.def.ghi', user: { username: 'admin' } });
    const api = createApi({ baseUrl, fetchFn, storage });

    const data = await api.login('admin', 'admin123');

    assert.equal(data.user.username, 'admin');
    assert.equal(storage.getItem(TOKEN_KEY), 'abc.def.ghi');
    assert.equal(api.isLoggedIn(), true);
    assert.equal(fetchFn.calls[0].url, 'http://api.test/api/auth/login');
    assert.equal(fetchFn.calls[0].options.method, 'POST');
    assert.deepEqual(JSON.parse(fetchFn.calls[0].options.body), { username: 'admin', password: 'admin123' });
  });

  test('ERROR: credenciales incorrectas muestran el mensaje del backend y no guardan token', async () => {
    const storage = fakeStorage();
    const fetchFn = fakeFetch(401, { error: 'Usuario o contraseña incorrectos' });
    const api = createApi({ baseUrl, fetchFn, storage });

    await assert.rejects(api.login('admin', 'mala'), {
      message: 'Usuario o contraseña incorrectos',
      status: 401,
    });
    assert.equal(storage.getItem(TOKEN_KEY), null);
    assert.equal(api.isLoggedIn(), false);
  });

  test('ERROR: campos vacíos no llaman a la API', async () => {
    const fetchFn = fakeFetch(200, {});
    const api = createApi({ baseUrl, fetchFn, storage: fakeStorage() });

    await assert.rejects(api.login('', ''), { message: 'Usuario y contraseña son obligatorios' });
    assert.equal(fetchFn.calls.length, 0);
  });

  test('ERROR: servidor caído o bloqueado por CORS muestra mensaje claro', async () => {
    const fetchFn = async () => {
      throw new TypeError('Failed to fetch');
    };
    const api = createApi({ baseUrl, fetchFn, storage: fakeStorage() });

    await assert.rejects(api.login('admin', 'admin123'), { message: 'No se pudo conectar con el servidor' });
  });
});

describe('getCursos()', () => {
  test('envía el token en el header Authorization', async () => {
    const storage = fakeStorage({ [TOKEN_KEY]: 'mi.token.jwt' });
    const fetchFn = fakeFetch(200, { usuario: 'admin', total: 1, cursos: [{ id: 1 }] });
    const api = createApi({ baseUrl, fetchFn, storage });

    const data = await api.getCursos();

    assert.equal(data.total, 1);
    assert.equal(fetchFn.calls[0].url, 'http://api.test/api/cursos');
    assert.equal(fetchFn.calls[0].options.headers.Authorization, 'Bearer mi.token.jwt');
  });

  test('ERROR: sin token no llama a la API', async () => {
    const fetchFn = fakeFetch(200, {});
    const api = createApi({ baseUrl, fetchFn, storage: fakeStorage() });

    await assert.rejects(api.getCursos(), { message: 'Debes iniciar sesión', status: 401 });
    assert.equal(fetchFn.calls.length, 0);
  });

  test('ERROR: token expirado (403) borra la sesión local', async () => {
    const storage = fakeStorage({ [TOKEN_KEY]: 'token.vencido' });
    const fetchFn = fakeFetch(403, { error: 'Token expirado' });
    const api = createApi({ baseUrl, fetchFn, storage });

    await assert.rejects(api.getCursos(), { message: 'Token expirado', status: 403 });
    assert.equal(storage.getItem(TOKEN_KEY), null);
  });
});

describe('logout()', () => {
  test('elimina el token', () => {
    const storage = fakeStorage({ [TOKEN_KEY]: 'x.y.z' });
    const api = createApi({ baseUrl, fetchFn: fakeFetch(200, {}), storage });

    api.logout();

    assert.equal(api.isLoggedIn(), false);
  });
});
