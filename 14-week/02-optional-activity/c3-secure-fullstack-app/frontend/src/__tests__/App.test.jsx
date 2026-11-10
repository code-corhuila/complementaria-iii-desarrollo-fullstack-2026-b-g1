import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

describe('App (flujo completo)', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('inicia sesión, guarda el JWT y muestra la vista protegida', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ token: 'jwt-abc' }) })
      .mockResolvedValueOnce({ ok: true, status: 200,
        json: () => Promise.resolve([{ id: 1, name: 'Mouse', description: '', price: 1000, stock: 2 }]) });
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Usuario'), 'admin');
    await user.type(screen.getByLabelText('Contraseña'), 'Admin123*');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Mouse')).toBeInTheDocument();
    expect(sessionStorage.getItem('productos.jwt')).toBe('jwt-abc');

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
    expect(sessionStorage.getItem('productos.jwt')).toBeNull();
  });
});
