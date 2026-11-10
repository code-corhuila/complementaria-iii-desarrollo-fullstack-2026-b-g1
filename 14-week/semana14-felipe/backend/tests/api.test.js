// Pruebas del backend con el runner nativo de Node (node:test) y fetch.
// Ejecutar: npm test
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'secreto-de-pruebas';
process.env.CORS_ORIGIN = 'http://localhost:8080';

const jwt = require('jsonwebtoken');
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => resolve()); // puerto libre aleatorio
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

async function login(username, password) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return { status: res.status, body: await res.json() };
}

describe('POST /api/auth/login', () => {
  test('devuelve un JWT con credenciales válidas', async () => {
    const { status, body } = await login('admin', 'admin123');
    assert.equal(status, 200);
    assert.equal(typeof body.token, 'string');
    assert.equal(body.user.username, 'admin');
    assert.equal(body.user.passwordHash, undefined, 'no debe exponer el hash');

    const payload = jwt.verify(body.token, 'secreto-de-pruebas');
    assert.equal(payload.username, 'admin');
    assert.ok(payload.exp > payload.iat, 'el token debe expirar');
  });

  test('ERROR: contraseña incorrecta responde 401', async () => {
    const { status, body } = await login('admin', 'mala-clave');
    assert.equal(status, 401);
    assert.equal(body.error, 'Usuario o contraseña incorrectos');
    assert.equal(body.token, undefined);
  });

  test('ERROR: campos vacíos responde 400', async () => {
    const { status, body } = await login('', '');
    assert.equal(status, 400);
    assert.match(body.error, /obligatorios/);
  });

  test('ERROR: JSON mal formado responde 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{mal json',
    });
    assert.equal(res.status, 400);
  });
});

describe('GET /api/cursos (protegido)', () => {
  test('con token válido devuelve los datos', async () => {
    const { body: { token } } = await login('estudiante', 'clave123');
    const res = await fetch(`${baseUrl}/api/cursos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.usuario, 'estudiante');
    assert.ok(Array.isArray(body.cursos));
    assert.ok(body.cursos.length > 0);
  });

  test('ERROR: sin token responde 401', async () => {
    const res = await fetch(`${baseUrl}/api/cursos`);
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, 'Token requerido');
  });

  test('ERROR: token falso responde 403', async () => {
    const res = await fetch(`${baseUrl}/api/cursos`, {
      headers: { Authorization: 'Bearer esto.no.es-un-jwt' },
    });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).error, 'Token inválido');
  });

  test('ERROR: token firmado con otro secreto responde 403', async () => {
    const forged = jwt.sign({ sub: 1, username: 'admin' }, 'otro-secreto');
    const res = await fetch(`${baseUrl}/api/cursos`, {
      headers: { Authorization: `Bearer ${forged}` },
    });
    assert.equal(res.status, 403);
  });

  test('ERROR: token expirado responde 403', async () => {
    const expired = jwt.sign(
      { sub: 1, username: 'admin', exp: Math.floor(Date.now() / 1000) - 60 },
      'secreto-de-pruebas',
    );
    const res = await fetch(`${baseUrl}/api/cursos`, {
      headers: { Authorization: `Bearer ${expired}` },
    });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).error, 'Token expirado');
  });
});

describe('GET /api/auth/me', () => {
  test('devuelve el usuario dueño del token', async () => {
    const { body: { token } } = await login('admin', 'admin123');
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).user.role, 'admin');
  });
});

describe('CORS', () => {
  test('el preflight desde el frontend permitido recibe los headers CORS', async () => {
    const res = await fetch(`${baseUrl}/api/cursos`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:8080',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization',
      },
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:8080');
    assert.match(res.headers.get('access-control-allow-headers'), /Authorization/);
  });

  test('ERROR: un origen no permitido no recibe headers CORS', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://sitio-malicioso.com' },
    });
    assert.equal(res.headers.get('access-control-allow-origin'), null);
  });
});
