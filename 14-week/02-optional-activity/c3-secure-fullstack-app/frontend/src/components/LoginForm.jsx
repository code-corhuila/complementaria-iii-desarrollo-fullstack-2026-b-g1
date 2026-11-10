import { useState } from 'react';
import { login } from '../api.js';

export default function LoginForm({ onLogin, notice = '' }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('Ingresa usuario y contraseña.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { token } = await login(username.trim(), password);
      onLogin(token);
    } catch (err) {
      setError(err.status === 401 ? 'Usuario o contraseña incorrectos.' : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>Iniciar sesión</h2>
      {notice && <p className="notice">{notice}</p>}
      <label htmlFor="username">Usuario</label>
      <input id="username" value={username} autoComplete="username"
        onChange={(e) => setUsername(e.target.value)} />
      <label htmlFor="password">Contraseña</label>
      <input id="password" type="password" value={password} autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)} />
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
    </form>
  );
}
