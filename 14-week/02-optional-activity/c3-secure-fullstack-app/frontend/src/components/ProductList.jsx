import { useEffect, useState } from 'react';
import { getProducts } from '../api.js';

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export default function ProductList({ token, onLogout, onSessionExpired }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProducts(token)
      .then((data) => active && setProducts(data))
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) {
          onSessionExpired();
        } else {
          setError(err.message);
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token, onSessionExpired]);

  return (
    <section className="card">
      <header className="row">
        <h2>Catálogo (endpoint protegido)</h2>
        <button type="button" className="secondary" onClick={onLogout}>Cerrar sesión</button>
      </header>
      {loading && <p>Cargando productos…</p>}
      {error && <p role="alert" className="error">{error}</p>}
      {!loading && !error && products.length === 0 && <p>No hay productos registrados.</p>}
      {products.length > 0 && (
        <table>
          <thead>
            <tr><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Stock</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>{money.format(p.price)}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
