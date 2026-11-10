import { useCallback, useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import ProductList from './components/ProductList.jsx';
import { tokenStorage } from './api.js';

export default function App() {
  const [token, setToken] = useState(() => tokenStorage.get());
  const [notice, setNotice] = useState('');

  function handleLogin(newToken) {
    tokenStorage.set(newToken);
    setNotice('');
    setToken(newToken);
  }

  const handleLogout = useCallback((message = '') => {
    tokenStorage.clear();
    setNotice(message);
    setToken(null);
  }, []);

  const handleSessionExpired = useCallback(
    () => handleLogout('Tu sesión expiró. Inicia sesión de nuevo.'),
    [handleLogout],
  );

  return (
    <main className="container">
      <h1>Productos</h1>
      {token ? (
        <ProductList
          token={token}
          onLogout={() => handleLogout()}
          onSessionExpired={handleSessionExpired}
        />
      ) : (
        <LoginForm onLogin={handleLogin} notice={notice} />
      )}
    </main>
  );
}
