const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let productos = [
  { id: 1, nombre: 'Producto Ejemplo A', precio: 1500 },
  { id: 2, nombre: 'Producto Ejemplo B', precio: 3000 }
];

app.get('/api/productos', (req, res) => {
  res.json(productos);
});

app.get('/api/productos/:id', (req, res) => {
  const producto = productos.find(p => p.id === parseInt(req.params.id));
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

app.post('/api/productos', (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || !precio) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }
  const nuevoProducto = {
    id: productos.length + 1,
    nombre,
    precio: Number(precio)
  };
  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));