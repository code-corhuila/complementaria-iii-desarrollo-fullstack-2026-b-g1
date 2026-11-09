const app = require('./app');
const { PORT, CORS_ORIGINS } = require('./config');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
  console.log(`CORS permitido para: ${CORS_ORIGINS.join(', ')}`);
});
