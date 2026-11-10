# Corte 3 — App fullstack segura y probada (Semana 14)

**Estudiante:** Andrés Felipe Gómez Anacona · **Asignatura:** Complementaria III — Profundización Desarrollo Fullstack · CORHUILA 2026-B

Aplicación fullstack que protege con **JWT** la API REST de Productos (actividad de la semana 9) y la consume desde un
frontend en **React**. Incluye login, una vista protegida con datos de la API, manejo de CORS, pruebas de backend y
frontend (con casos de error) y ejecución en contenedores con **Docker**.

## Estructura

```
c3-secure-fullstack-app/
├── backend/                 # Spring Boot 3.3 · Java 17 · Spring Security · JWT (jjwt 0.12)
│   ├── src/main/java/com/ejemplo/productos/
│   │   ├── auth/            # AuthController (POST /api/v1/auth/login) y DTOs
│   │   ├── security/        # JwtService, JwtAuthenticationFilter, JsonAuthenticationEntryPoint
│   │   ├── config/          # SecurityConfig (JWT + CORS + BCrypt), OpenApiConfig, DataSeeder
│   │   ├── controller/ service/ repository/ entity/ exception/
│   ├── src/test/java/...    # AuthControllerTest, ProductSecurityTest, ProductosApiApplicationTests
│   ├── Productos-API.postman_collection.json
│   └── Dockerfile
├── frontend/                # React 18 · Vite 5 · Vitest + Testing Library
│   ├── src/api.js           # cliente HTTP, guarda el JWT en sessionStorage
│   ├── src/components/      # LoginForm.jsx, ProductList.jsx
│   ├── src/__tests__/       # pruebas de login, vista protegida y flujo completo
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Java 17, Spring Boot 3.3.5 (Web, Data JPA, Validation, Security), jjwt 0.12.6, H2, springdoc-openapi |
| Frontend | React 18.3, Vite 5.4 |
| Pruebas | JUnit 5 + MockMvc + spring-security-test · Vitest 2 + Testing Library · Postman |
| Contenedores | Docker (multi-stage), Docker Compose, nginx |

## Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/v1/auth/login` | Público — devuelve el JWT |
| GET | `/api/v1/products` | **Protegido** (Bearer JWT) |
| GET | `/api/v1/products/{id}` | **Protegido** |
| POST | `/api/v1/products` | **Protegido** |
| PUT | `/api/v1/products/{id}` | **Protegido** |
| DELETE | `/api/v1/products/{id}` | **Protegido** |
| GET | `/swagger-ui.html` | Público (botón *Authorize* para pegar el token) |

Ejemplo de login:

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "username": "admin", "password": "Admin123*" }
```

```json
{ "token": "eyJhbGciOiJIUzI1NiJ9...", "tokenType": "Bearer", "expiresIn": 3600, "username": "admin" }
```

Errores: credenciales incorrectas → `401`; campos vacíos → `400`; endpoint protegido sin token o con token inválido → `401`.

## Ejecución local (sin Docker)

Requisitos: JDK 17+, Maven 3.9+ y Node.js 20+.

**Backend** (http://localhost:8080):

```bash
cd backend
mvn spring-boot:run
```

Sin variables de entorno usa valores de desarrollo: usuario `admin`, contraseña `Admin123*`.

**Frontend** (http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

## Pruebas

| Tipo | Archivo | Casos |
|---|---|---|
| Backend | `AuthControllerTest` | login correcto (200 + token) · **error** contraseña incorrecta (401) · **error** campos vacíos (400) |
| Backend | `ProductSecurityTest` | token válido (200 + datos) · **error** sin token (401) · **error** token alterado (401) · CORS permitido · CORS rechazado (403) |
| Frontend | `LoginForm.test.jsx` | login correcto entrega el token · **error** 401 visible · **error** formulario vacío |
| Frontend | `ProductList.test.jsx` | envía `Authorization: Bearer` y muestra datos · **error** 401 cierra sesión · **error** API caída visible |
| Frontend | `App.test.jsx` | flujo completo: login → vista protegida → cerrar sesión |

```bash
cd backend && mvn test          # o con Docker: docker run --rm -v "${PWD}:/app" -w /app maven:3.9-eclipse-temurin-17 mvn -B test
cd frontend && npm test
```

La colección `backend/Productos-API.postman_collection.json` empieza con el login: guarda el token en la variable
`{{token}}` y el resto de peticiones lo envían como *Bearer*.

## Ejecución con Docker

```bash
cp .env.example .env            # PowerShell: Copy-Item .env.example .env
# edita .env: JWT_SECRET (32+ caracteres) y APP_PASSWORD
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

Solo el backend en un contenedor:

```bash
docker build -t productos-api ./backend
docker run --rm -p 8080:8080 -e JWT_SECRET=un-secreto-largo-de-al-menos-32-caracteres -e APP_PASSWORD=Admin123* productos-api
```

Detener: `Ctrl + C` y luego `docker compose down`.

## Security & Run

The API uses stateless authentication with JSON Web Tokens (JWT). The client sends a username and password to the public
endpoint `POST /api/v1/auth/login`; Spring Security checks the password against a BCrypt hash and, if it is correct,
the API returns a token signed with HMAC-SHA256 that expires after 60 minutes. Every request to the protected endpoints
under `/api/v1/products` must include the header `Authorization: Bearer <token>`, and a custom filter verifies the
signature and the expiration date before the request reaches the controller. Requests without a token, or with an
invalid or expired token, receive a JSON `401 Unauthorized` response, and wrong credentials on login also return `401`
without revealing whether the username or the password failed. The React frontend stores the token in `sessionStorage`,
sends it in the `Authorization` header, shows authentication errors on the screen and logs the user out when the API
answers `401`. CORS is configured on the backend so that only the frontend origins listed in `CORS_ALLOWED_ORIGINS`
(by default `http://localhost:3000` and `http://localhost:5173`) can call the API from the browser; any other origin is
rejected. The backend tests use JUnit 5 and MockMvc to cover a successful login, a wrong password, missing and tampered
tokens and the CORS rules, and they run with `mvn test`; the frontend tests use Vitest and Testing Library to cover a
successful login, a `401` error and the protected product list, and they run with `npm test`. To run the whole
application with Docker, copy `.env.example` to `.env`, set a strong `JWT_SECRET` and `APP_PASSWORD`, and execute
`docker compose up --build`; the frontend is then available at `http://localhost:3000` and the API at
`http://localhost:8080`. As security measures, secrets are read from environment variables and never committed, the
`.env` file is ignored by Git, sessions are disabled on the server, the H2 console is turned off, and the backend
container runs as a non-root user.

## Cumplimiento de la rúbrica

| Criterio | Evidencia |
|---|---|
| JWT + integración (CORS) — 2.0 | `AuthController`, `JwtService`, `JwtAuthenticationFilter`, `SecurityConfig` (CORS); el frontend inicia sesión y muestra productos del endpoint protegido |
| Pruebas back + front con error — 1.5 | 8 pruebas de backend (5 de error) y 7 de frontend (4 de error) |
| Docker — 1.0 | `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` |
| "Security & run" (EN) — 0.5 | Sección anterior (más de 5 oraciones en inglés) |
