import React, { useState, useEffect } from 'react';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

const App: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Producto | null>(null);

  const API_URL = 'http://localhost:3000/api/productos';

  const obtenerProductos = async () => {
    try {
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al conectar con la API');
      const data = await response.json();
      setProductos(data);
    } catch (err: any) {
      setError('Error de red: No se pudo cargar la lista de productos.');
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) return;

    try {
      setError(null);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio: Number(precio) })
      });

      if (!response.ok) throw new Error('Error al guardar registro');

      setNombre('');
      setPrecio('');
      obtenerProductos();
    } catch (err: any) {
      setError('Error de red: No se pudo enviar la información.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Gestión de Productos (Ionic React)</h2>

      {error && (
        <div style={{ padding: '10px', background: '#ffe6e6', color: 'red', borderRadius: '5px', marginBottom: '15px' }}>
          ⚠️ {error}
        </div>
      )}

      <h3>Agregar Nuevo Producto</h3>
      <form onSubmit={guardarProducto} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nombre del Producto</label>
          <input 
            type="text" 
            value={nombre} 
            onChange={e => setNombre(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Precio</label>
          <input 
            type="number" 
            value={precio} 
            onChange={e => setPrecio(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
          />
        </div>
        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Guardar Producto
        </button>
      </form>

      <h3 style={{ marginTop: '30px' }}>Lista de Productos</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {productos.map(item => (
          <li 
            key={item.id} 
            onClick={() => setDetalle(item)}
            style={{ padding: '10px', borderBottom: '1px solid #ccc', cursor: 'pointer' }}
          >
            <strong>{item.nombre}</strong> - ${item.precio}
          </li>
        ))}
      </ul>

      {detalle && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #007bff', borderRadius: '8px', background: '#f8f9fa' }}>
          <h3>Detalle del Elemento</h3>
          <p><strong>ID:</strong> {detalle.id}</p>
          <p><strong>Nombre:</strong> {detalle.nombre}</p>
          <p><strong>Precio:</strong> ${detalle.precio}</p>
          <button onClick={() => setDetalle(null)} style={{ padding: '5px 10px', cursor: 'pointer' }}>
            Cerrar Detalle
          </button>
        </div>
      )}
    </div>
  );
};

export default App;