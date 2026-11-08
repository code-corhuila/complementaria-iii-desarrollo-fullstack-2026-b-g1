import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  iniciarSesion,
  obtenerVideojuegos,
} from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('GameVault API', () => {
  it('devuelve el JWT cuando el login es correcto', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'jwt-de-prueba',
        tipo: 'Bearer',
      }),
    }))

    const resultado = await iniciarSesion(
      'juan@example.com', 'Password123!'
    )

    expect(resultado.token).toBe('jwt-de-prueba')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('muestra un error cuando las credenciales fallan', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'Correo o contraseña incorrectos',
      }),
    }))

    await expect(
      iniciarSesion('juan@example.com', 'incorrecta')
    ).rejects.toThrow('Correo o contraseña incorrectos')
  })

  it('envía el token al consultar la biblioteca', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([]),
    }))

    await obtenerVideojuegos('jwt-de-prueba')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/videojuegos'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-de-prueba',
        }),
      })
    )
  })
})
