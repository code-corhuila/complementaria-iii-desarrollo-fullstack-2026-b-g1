const crypto = require('node:crypto');

// Las contraseñas NUNCA se guardan en texto plano: se guarda "sal:hash" usando scrypt.
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(hash, 'hex');
  // timingSafeEqual evita ataques por diferencia de tiempo al comparar.
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

// Usuarios de demostración (en un proyecto real vendrían de una base de datos).
const users = [
  { id: 1, username: 'admin', name: 'Administrador', role: 'admin', passwordHash: hashPassword('admin123') },
  { id: 2, username: 'estudiante', name: 'Estudiante Corhuila', role: 'student', passwordHash: hashPassword('clave123') },
];

function findByUsername(username) {
  return users.find((user) => user.username === username);
}

function findById(id) {
  return users.find((user) => user.id === id);
}

// Devuelve el usuario sin el hash de la contraseña.
function toPublicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

module.exports = { findByUsername, findById, verifyPassword, toPublicUser };
