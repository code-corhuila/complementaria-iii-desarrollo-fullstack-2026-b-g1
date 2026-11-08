
const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? '' : 'http://localhost:3000');

export interface Pet {
  id: number;
  name: string;
  species: string;
  age: number;
  owner: string;
}

export interface Appointment {
  id: number;
  petId: number;
  reason: string;
  date: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      'No fue posible conectar con el servidor.',
      0
    );
  }

  if (response.status === 401) {
    throw new ApiError(
      'Credenciales incorrectas o sesión expirada.',
      401
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `Error HTTP ${response.status}`,
      response.status
    );
  }

  return response.json() as Promise<T>;
}

export async function login(
  email: string,
  password: string
): Promise<string> {
  const response = await request<{ token: string }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  );

  if (!response.token) {
    throw new ApiError('Token no recibido.', 500);
  }

  return response.token;
}

export function getPets(token: string): Promise<Pet[]> {
  return request<Pet[]>('/api/pets', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getAppointments(
  token: string
): Promise<Appointment[]> {
  return request<Appointment[]>('/api/appointments', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
