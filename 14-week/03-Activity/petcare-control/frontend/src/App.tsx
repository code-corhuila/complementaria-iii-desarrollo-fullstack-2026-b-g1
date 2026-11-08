
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ApiError,
  login,
  getPets,
  getAppointments,
  type Pet,
  type Appointment,
} from './services/api';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const jwt = await login(email, password);
      setToken(jwt);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al iniciar sesión.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;

    let active = true;

    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [petsData, appointmentsData] = await Promise.all([
          getPets(token!),
          getAppointments(token!),
        ]);

        if (active) {
          setPets(petsData);
          setAppointments(appointmentsData);
        }
      } catch (err) {
        if (!active) return;

        if (err instanceof ApiError && err.status === 401) {
          setToken(null);
          setPets([]);
          setAppointments([]);
          setError('Tu sesión ha expirado. Ingresa nuevamente.');
        } else {
          setError(
            err instanceof Error ? err.message : 'Error al cargar datos.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [token]);

  function logout() {
    setToken(null);
    setPets([]);
    setAppointments([]);
    setPassword('');
    setError('');
  }

  if (!token) {
    return (
      <main className="container">
        <section className="login-card">
          <h1>PetCare Control</h1>
          <p>Gestión de mascotas y citas veterinarias</p>

          <h2>Iniciar sesión</h2>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <p role="alert" className="error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>PetCare Control</h1>
            <p>Panel de gestión veterinaria</p>
          </div>

          <button onClick={logout}>Cerrar sesión</button>
        </header>

        {loading && <p role="status">Cargando información...</p>}

        {error && <p role="alert" className="error">{error}</p>}

        {!loading && !error && (
          <>
            <h2>Mis mascotas</h2>

            <div className="cards-grid">
              {pets.map((pet) => (
                <article className="pet-card" key={pet.id}>
                  <h3>{pet.name}</h3>
                  <p><strong>Especie:</strong> {pet.species}</p>
                  <p><strong>Edad:</strong> {pet.age} años</p>
                  <p><strong>Responsable:</strong> {pet.owner}</p>
                </article>
              ))}
            </div>

            {pets.length === 0 && <p>No hay mascotas registradas.</p>}

            <h2>Próximas citas</h2>

            <div className="cards-grid">
              {appointments.map((appointment) => {
                const pet = pets.find(
                  (item) => item.id === appointment.petId
                );

                return (
                  <article className="pet-card" key={appointment.id}>
                    <h3>{appointment.reason}</h3>
                    <p><strong>Mascota:</strong> {pet?.name ?? 'Sin asignar'}</p>
                    <p><strong>Fecha:</strong> {appointment.date}</p>
                  </article>
                );
              })}
            </div>

            {appointments.length === 0 && (
              <p>No hay citas programadas.</p>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default App;
