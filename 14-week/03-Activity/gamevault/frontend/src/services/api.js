const API_URL = import.meta.env.VITE_API_URL ?? ''

async function request(endpoint, options = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor.')
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.error || `Error del servidor (${response.status})`
    )
  }

  return data
}

export function registrarUsuario(nombre, correo, password) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nombre, correo, password }),
  })
}

export function iniciarSesion(correo, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  })
}

export function obtenerVideojuegos(token) {
  return request('/api/videojuegos', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function crearVideojuego(token, videojuego) {
  return request('/api/videojuegos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(videojuego),
  })
}

export async function eliminarVideojuego(token, id) {
  const response = await fetch(`${API_URL}/api/videojuegos/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('No se pudo eliminar el videojuego.')
  }
}
