import { render, screen, waitFor } from '@testing-library/react';
import ProductList from '../components/ProductList.jsx';

function mockFetch(status, body) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('ProductList', () => {
  afterEach(() => vi.restoreAllMocks());

  it('envía el JWT y muestra los productos de la API protegida', async () => {
    mockFetch(200, [{ id: 1, name: 'Teclado mecánico', description: 'RGB', price: 249900, stock: 25 }]);
    render(<ProductList token="jwt-123" onLogout={vi.fn()} onSessionExpired={vi.fn()} />);

    expect(await screen.findByText('Teclado mecánico')).toBeInTheDocument();
    const [, options] = globalThis.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer jwt-123');
  });

  it('cierra la sesión cuando la API responde 401 (token inválido o expirado)', async () => {
    mockFetch(401, { status: 401, message: 'Se requiere un token JWT valido' });
    const onSessionExpired = vi.fn();
    render(<ProductList token="expirado" onLogout={vi.fn()} onSessionExpired={onSessionExpired} />);

    await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByText('Cargando productos…')).not.toBeInTheDocument());
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra un error visible si la API no responde', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    render(<ProductList token="jwt-123" onLogout={vi.fn()} onSessionExpired={vi.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con la API');
  });
});
