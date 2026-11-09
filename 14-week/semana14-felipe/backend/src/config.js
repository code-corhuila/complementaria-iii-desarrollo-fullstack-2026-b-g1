// Configuración centralizada. Todo se puede sobrescribir con variables de entorno.
const config = {
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-cambiar-en-produccion',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  // Orígenes (frontends) que pueden llamar a la API desde el navegador.
  CORS_ORIGINS: (process.env.CORS_ORIGIN || 'http://localhost:8080,http://127.0.0.1:8080')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

module.exports = config;
