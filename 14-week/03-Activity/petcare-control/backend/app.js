
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));

app.use(express.json());

const users = [];

const pets = [
  {
    id: 1,
    name: 'Max',
    species: 'Perro',
    age: 3,
    owner: 'David',
  },
  {
    id: 2,
    name: 'Luna',
    species: 'Gato',
    age: 2,
    owner: 'David',
  },
];

const appointments = [
  {
    id: 1,
    petId: 1,
    reason: 'Vacunación',
    date: '2026-11-15',
  },
  {
    id: 2,
    petId: 2,
    reason: 'Control general',
    date: '2026-11-20',
  },
];

function authenticate(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Token requerido',
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret missing');
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      message: 'Token inválido o expirado',
    });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    application: 'PetCare Control',
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.includes('@') ||
    password.length < 8
  ) {
    return res.status(400).json({
      message: 'Correo inválido o contraseña demasiado corta',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(user => user.email === normalizedEmail)) {
    return res.status(409).json({
      message: 'El usuario ya existe',
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  users.push({
    id: users.length + 1,
    email: normalizedEmail,
    passwordHash,
  });

  return res.status(201).json({
    message: 'Usuario registrado correctamente',
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      message: 'Correo y contraseña obligatorios',
    });
  }

  const user = users.find(
    item => item.email === email.trim().toLowerCase()
  );

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      message: 'Credenciales incorrectas',
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    return res.status(500).json({
      message: 'Configuración de seguridad incompleta',
    });
  }

  const token = jwt.sign(
    { sub: String(user.id), email: user.email },
    secret,
    { expiresIn: '1h' }
  );

  return res.json({ token });
});

app.get('/api/pets', authenticate, (_req, res) => {
  res.json(pets);
});

app.get('/api/appointments', authenticate, (_req, res) => {
  res.json(appointments);
});

module.exports = app;
