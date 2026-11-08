
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

vi.mock('./services/api', () => ({
  login: vi.fn(),
  getPets: vi.fn(),
  getAppointments: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

import { login, getPets, getAppointments } from './services/api';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PetCare Control - Frontend', () => {
  it('muestra el formulario de inicio de sesión', () => {
    render(<App />);

    expect(
      screen.getByLabelText('Correo electrónico')
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Contraseña')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Ingresar' })
    ).toBeInTheDocument();
  });

  it('muestra un error cuando el login falla', async () => {
    vi.mocked(login).mockRejectedValue(
      new Error('Credenciales incorrectas')
    );

    render(<App />);

    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'incorrecto@petcare.test'
    );

    await user.type(
      screen.getByLabelText('Contraseña'),
      'Password123!'
    );

    await user.click(
      screen.getByRole('button', { name: 'Ingresar' })
    );

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Credenciales incorrectas');
  });

  it('muestra mascotas y citas después de iniciar sesión', async () => {
    vi.mocked(login).mockResolvedValue('jwt-de-prueba');

    vi.mocked(getPets).mockResolvedValue([
      {
        id: 1,
        name: 'Max',
        species: 'Perro',
        age: 3,
        owner: 'David',
      },
    ]);

    vi.mocked(getAppointments).mockResolvedValue([
      {
        id: 1,
        petId: 1,
        reason: 'Vacunación',
        date: '2026-11-15',
      },
    ]);

    render(<App />);

    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'david@petcare.test'
    );

    await user.type(
      screen.getByLabelText('Contraseña'),
      'PetCare2026!'
    );

    await user.click(
      screen.getByRole('button', { name: 'Ingresar' })
    );

    expect(
  await screen.findByRole('heading', { name: 'Max' })
).toBeInTheDocument();

    expect(
      screen.getByText('Vacunación')
    ).toBeInTheDocument();
  });
});
