
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('ERROR: JWT_SECRET debe tener al menos 32 caracteres.');
  process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PetCare Control API: http://localhost:${PORT}`);
});
