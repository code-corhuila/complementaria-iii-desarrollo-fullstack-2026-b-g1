const express = require('express');
const cors = require('cors');
const { CORS_ORIGINS } = require('./config');
const authRoutes = require('./routes/auth');
const cursosRoutes = require('./routes/cursos');

const app = express();

// CORS: solo los orígenes permitidos (el frontend) pueden llamar la API desde el navegador.
app.use(
  cors({
    origin(origin, callback) {
      // Peticiones sin "Origin" (curl, Postman, pruebas) se permiten.
      if (!origin || CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(null, false); // sin headers CORS -> el navegador bloquea la respuesta
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

// Ruta pública
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursosRoutes);

// 404 para rutas desconocidas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores (por ejemplo, JSON mal formado en el body)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
