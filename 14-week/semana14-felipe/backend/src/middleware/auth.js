const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Middleware que protege rutas: exige el header "Authorization: Bearer <token>".
function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    // Solo aceptamos HS256 para evitar ataques de cambio de algoritmo.
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(403).json({ error: message });
  }
}

module.exports = { authenticateToken };
