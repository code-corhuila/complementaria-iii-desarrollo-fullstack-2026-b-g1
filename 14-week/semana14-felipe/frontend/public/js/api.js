// Cliente de la API. No toca el DOM, así se puede probar con Node.
export const TOKEN_KEY = 'jwt_token';

export function createApi({
  baseUrl,
  fetchFn = (...args) => globalThis.fetch(...args),
  storage = globalThis.localStorage,
}) {
  async function request(path, options = {}) {
    let res;
    try {
      res = await fetchFn(`${baseUrl}${path}`, options);
    } catch {
      // fetch falla con TypeError si el servidor está caído o CORS bloquea la respuesta
      throw new Error('No se pudo conectar con el servidor');
    }

    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok) {
      const error = new Error((body && body.error) || `Error ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return body;
  }

  return {
    async login(username, password) {
      if (!username || !password) {
        throw new Error('Usuario y contraseña son obligatorios');
      }
      const data = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      storage.setItem(TOKEN_KEY, data.token);
      return data;
    },

    async getCursos() {
      const token = storage.getItem(TOKEN_KEY);
      if (!token) {
        const error = new Error('Debes iniciar sesión');
        error.status = 401;
        throw error;
      }
      try {
        return await request('/api/cursos', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        // Token vencido o inválido: cerramos la sesión local
        if (error.status === 401 || error.status === 403) {
          storage.removeItem(TOKEN_KEY);
        }
        throw error;
      }
    },

    logout() {
      storage.removeItem(TOKEN_KEY);
    },

    isLoggedIn() {
      return Boolean(storage.getItem(TOKEN_KEY));
    },
  };
}
