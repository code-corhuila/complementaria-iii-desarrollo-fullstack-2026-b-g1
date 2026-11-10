const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { findByUsername, findById, verifyPassword, toPublicUser } = require('../users');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login  -> { token, tokenType, expiresIn, user }
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }

  const user = findByUsername(String(username));
  // Mismo mensaje para usuario inexistente y contraseña errada (no revelamos cuál falló).
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const token = jwt.sign(
    { sub: String(user.id), username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' },
  );

  return res.json({ token, tokenType: 'Bearer', expiresIn: JWT_EXPIRES_IN, user: toPublicUser(user) });
});

// GET /api/auth/me  (protegido) -> datos del usuario dueño del token
router.get('/me', authenticateToken, (req, res) => {
  const user = findById(Number(req.user.sub));
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  return res.json({ user: toPublicUser(user) });
});

module.exports = router;
