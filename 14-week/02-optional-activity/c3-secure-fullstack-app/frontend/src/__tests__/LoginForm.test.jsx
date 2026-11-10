import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/LoginForm.jsx';

function mockFetch(status, body) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

async function fillAndSubmit(username, password) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Usuario'), username);
  await user.type(screen.getByLabelText('Contraseña'), password);
  await user.click(screen.getByRole('button', { name: 'Ingresar' }));
}

describe('LoginForm', () => {
  afterEach(() => vi.restoreAllMocks());

  it('envía las credenciales y entrega el token al iniciar sesión', async () => {
    mockFetch(200, { token: 'jwt-123', tokenType: 'Bearer' });
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await fillAndSubmit('admin', 'Admin123*');

    expect(onLogin).toHaveBeenCalledWith('jwt-123');
    const [url, options] = globalThis.fetch.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/auth\/login$/);
    expect(JSON.parse(options.body)).toEqual({ username: 'admin', password: 'Admin123*' });
  });

  it('muestra un error visible cuando las credenciales son incorrectas (401)', async () => {
    mockFetch(401, { status: 401, message: 'Usuario o contraseña incorrectos' });
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await fillAndSubmit('admin', 'incorrecta');

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.');
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('no llama a la API si el formulario está vacío', async () => {
    globalThis.fetch = vi.fn();
    render(<LoginForm onLogin={vi.fn()} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Ingresa usuario y contraseña.');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
