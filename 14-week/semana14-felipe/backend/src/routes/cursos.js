const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const cursos = [
  { id: 1, nombre: 'Desarrollo Web', docente: 'Ing. Pérez', creditos: 3, semestre: 4 },
  { id: 2, nombre: 'Bases de Datos', docente: 'Ing. Gómez', creditos: 4, semestre: 3 },
  { id: 3, nombre: 'Ingeniería de Software', docente: 'Ing. Rojas', creditos: 3, semestre: 5 },
  { id: 4, nombre: 'Redes y Seguridad', docente: 'Ing. Castro', creditos: 3, semestre: 6 },
];

// Todas las rutas de este router requieren un JWT válido.
router.use(authenticateToken);

// GET /api/cursos
router.get('/', (req, res) => {
  res.json({ usuario: req.user.username, total: cursos.length, cursos });
});

// GET /api/cursos/:id
router.get('/:id', (req, res) => {
  const curso = cursos.find((c) => c.id === Number(req.params.id));
  if (!curso) {
    return res.status(404).json({ error: 'Curso no encontrado' });
  }
  return res.json(curso);
});

module.exports = router;
