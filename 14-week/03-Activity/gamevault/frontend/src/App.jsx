import { useEffect, useState } from 'react'
import {
  registrarUsuario,
  iniciarSesion,
  obtenerVideojuegos,
  crearVideojuego,
  eliminarVideojuego,
} from './services/api'
import './App.css'

const FORM_INICIAL = {
  titulo: '',
  genero: 'Acción',
  estado: 'Pendiente',
  progreso: 0,
}

export default function App() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem('gamevault_token') || ''
  )
  const [usuario, setUsuario] = useState(
    () => JSON.parse(sessionStorage.getItem('gamevault_usuario') || 'null')
  )
  const [modo, setModo] = useState('login')
  const [credenciales, setCredenciales] = useState({
    nombre: '',
    correo: '',
    password: '',
  })
  const [juegos, setJuegos] = useState([])
  const [formJuego, setFormJuego] = useState(FORM_INICIAL)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [cargandoJuegos, setCargandoJuegos] = useState(false)

  function cerrarSesion() {
    sessionStorage.removeItem('gamevault_token')
    sessionStorage.removeItem('gamevault_usuario')
    setToken('')
    setUsuario(null)
    setJuegos([])
    setError('')
    setMensaje('')
  }

  useEffect(() => {
    if (!token) return

    let activo = true

    async function cargar() {
      setCargandoJuegos(true)
      try {
        const datos = await obtenerVideojuegos(token)
        if (activo) setJuegos(datos)
      } catch (err) {
        if (!activo) return
        if (err.message.includes('401')) {
          cerrarSesion()
        } else {
          setError(err.message)
        }
      } finally {
        if (activo) setCargandoJuegos(false)
      }
    }

    cargar()
    return () => { activo = false }
  }, [token])

  async function enviarAuth(event) {
    event.preventDefault()
    setError('')
    setMensaje('')
    setCargando(true)

    try {
      if (modo === 'registro') {
        await registrarUsuario(
          credenciales.nombre,
          credenciales.correo,
          credenciales.password
        )
        setModo('login')
        setCredenciales({
          ...credenciales,
          password: '',
        })
        setMensaje('Cuenta creada. Ahora inicia sesión.')
      } else {
        const respuesta = await iniciarSesion(
          credenciales.correo,
          credenciales.password
        )
        sessionStorage.setItem('gamevault_token', respuesta.token)
        sessionStorage.setItem(
          'gamevault_usuario',
          JSON.stringify(respuesta.usuario)
        )
        setUsuario(respuesta.usuario)
        setToken(respuesta.token)
        setCredenciales({ nombre: '', correo: '', password: '' })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function guardarJuego(event) {
    event.preventDefault()
    setError('')
    setMensaje('')
    setCargando(true)

    try {
      const nuevo = await crearVideojuego(token, {
        ...formJuego,
        progreso: Number(formJuego.progreso),
      })
      setJuegos(actuales => [...actuales, nuevo])
      setFormJuego(FORM_INICIAL)
      setMensaje('Videojuego agregado correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function borrarJuego(id) {
    if (!window.confirm('¿Eliminar este videojuego?')) return

    setError('')
    setMensaje('')

    try {
      await eliminarVideojuego(token, id)
      setJuegos(actuales => actuales.filter(j => j.id !== id))
      setMensaje('Videojuego eliminado.')
    } catch (err) {
      setError(err.message)
    }
  }

  if (!token) {
    return (
      <main className="auth-layout">
        <section className="auth-intro">
          <div className="logo">🎮 GAME<span>VAULT</span></div>
          <div className="intro-content">
            <div className="eyebrow">TU UNIVERSO GAMER</div>
            <h1>Todos tus juegos.<br /><span>Un solo lugar.</span></h1>
            <p>
              Organiza tu colección, registra tus avances
              y lleva tu biblioteca de videojuegos al siguiente nivel.
            </p>
            <div className="intro-tags">
              <span>✦ Biblioteca personal</span>
              <span>✦ Acceso seguro</span>
              <span>✦ Control de progreso</span>
            </div>
          </div>
          <div className="intro-footer">GAMEVAULT · 2026</div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-icon">🎮</div>
            <h2>{modo === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
            <p className="muted">
              {modo === 'login'
                ? 'Inicia sesión para acceder a tu colección.'
                : 'Comienza a organizar tus videojuegos.'}
            </p>

            <form onSubmit={enviarAuth}>
              {modo === 'registro' && (
                <label>
                  Nombre completo
                  <input
                    required
                    value={credenciales.nombre}
                    onChange={e => setCredenciales({
                      ...credenciales, nombre: e.target.value
                    })}
                    placeholder="Tu nombre"
                  />
                </label>
              )}

              <label>
                Correo electrónico
                <input
                  type="email"
                  required
                  value={credenciales.correo}
                  onChange={e => setCredenciales({
                    ...credenciales, correo: e.target.value
                  })}
                  placeholder="correo@ejemplo.com"
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  required
                  minLength={modo === 'registro' ? 8 : undefined}
                  value={credenciales.password}
                  onChange={e => setCredenciales({
                    ...credenciales, password: e.target.value
                  })}
                  placeholder="Tu contraseña"
                />
              </label>

              {error && <div className="alert error" role="alert">{error}</div>}
              {mensaje && <div className="alert success">{mensaje}</div>}

              <button className="primary-btn" disabled={cargando}>
                {cargando ? 'Procesando...' :
                  modo === 'login' ? 'Iniciar sesión →' : 'Crear cuenta →'}
              </button>
            </form>

            <p className="switch-auth">
              {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setModo(modo === 'login' ? 'registro' : 'login')
                  setError('')
                  setMensaje('')
                }}
              >
                {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">🎮 GAME<span>VAULT</span></div>
        <div className="nav-active">▦ Mi biblioteca</div>
        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">
              {usuario?.nombre?.charAt(0).toUpperCase() || 'G'}
            </div>
            <div>
              <strong>{usuario?.nombre}</strong>
              <small>Mi cuenta</small>
            </div>
          </div>
          <button className="logout-btn" onClick={cerrarSesion}>
            Cerrar sesión ↗
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <div className="eyebrow">MI ESPACIO GAMER</div>
            <h1>Mi biblioteca <span>🎮</span></h1>
            <p className="muted">Organiza y controla tus videojuegos favoritos.</p>
          </div>
          <div className="header-tag">● SESIÓN SEGURA</div>
        </header>

        <div className="stat-grid">
          <div className="stat-card">
            <span>JUEGOS TOTALES</span>
            <strong>{juegos.length}</strong>
            <small>En tu colección</small>
          </div>
          <div className="stat-card">
            <span>JUGANDO</span>
            <strong>{juegos.filter(j => j.estado === 'Jugando').length}</strong>
            <small>En progreso</small>
          </div>
          <div className="stat-card">
            <span>COMPLETADOS</span>
            <strong>{juegos.filter(j => j.estado === 'Completado').length}</strong>
            <small>Terminados</small>
          </div>
        </div>

        {error && <div className="alert error" role="alert">{error}</div>}
        {mensaje && <div className="alert success">{mensaje}</div>}

        <section className="content-grid">
          <div className="library-section">
            <div className="section-header">
              <h2>Mis videojuegos</h2>
              <span className="count">{juegos.length} juegos</span>
            </div>

            {cargandoJuegos ? (
              <div className="empty-state">Cargando videojuegos...</div>
            ) : juegos.length === 0 ? (
              <div className="empty-state">
                <div>🎮</div>
                <h3>Tu biblioteca está vacía</h3>
                <p>Agrega tu primer videojuego para comenzar.</p>
              </div>
            ) : (
              <div className="games-list">
                {juegos.map(juego => (
                  <article className="game-card" key={juego.id}>
                    <div className="game-icon">🎮</div>
                    <div className="game-info">
                      <div className="game-top">
                        <h3>{juego.titulo}</h3>
                        <span className="status">{juego.estado}</span>
                      </div>
                      <p>{juego.genero}</p>
                      <div className="progress-info">
                        <span>Progreso</span>
                        <strong>{juego.progreso}%</strong>
                      </div>
                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-valuenow={juego.progreso}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={`Progreso de ${juego.titulo}`}
                      >
                        <div style={{ width: `${juego.progreso}%` }} />
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      aria-label={`Eliminar ${juego.titulo}`}
                      onClick={() => borrarJuego(juego.id)}
                    >✕</button>
                  </article>
                ))}
              </div>
            )}
          </div>

          <section className="add-panel">
            <h2>✦ Agregar videojuego</h2>
            <p className="muted">Añade un nuevo título a tu colección.</p>
            <form onSubmit={guardarJuego}>
              <label>
                Título del juego
                <input
                  required
                  value={formJuego.titulo}
                  onChange={e => setFormJuego({
                    ...formJuego, titulo: e.target.value
                  })}
                  placeholder="Ej. Minecraft"
                />
              </label>
              <label>
                Género
                <select
                  value={formJuego.genero}
                  onChange={e => setFormJuego({
                    ...formJuego, genero: e.target.value
                  })}
                >
                  {['Acción', 'Aventura', 'RPG', 'Deportes',
                    'Estrategia', 'Simulación', 'Carreras',
                    'Otro'].map(g => <option key={g}>{g}</option>)}
                </select>
              </label>
              <label>
                Estado
                <select
                  value={formJuego.estado}
                  onChange={e => setFormJuego({
                    ...formJuego, estado: e.target.value
                  })}
                >
                  {['Pendiente', 'Jugando', 'Completado'].map(e => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </label>
              <label>
                Progreso: {formJuego.progreso}%
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formJuego.progreso}
                  onChange={e => setFormJuego({
                    ...formJuego, progreso: Number(e.target.value)
                  })}
                />
              </label>
              <button className="primary-btn" disabled={cargando}>
                {cargando ? 'Guardando...' : '+ Agregar a biblioteca'}
              </button>
            </form>
          </section>
        </section>
      </main>
    </div>
  )
}
