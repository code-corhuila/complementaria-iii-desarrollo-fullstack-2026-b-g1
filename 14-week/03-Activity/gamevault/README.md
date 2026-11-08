# GameVault — Secure Fullstack Gaming Library

GameVault is a fullstack application for managing a personal video game collection.

## Technologies

- Backend: Java 17, Spring Boot, Spring Security, JWT, Spring Data JPA, H2.
- Frontend: React and Vite.
- Testing: JUnit, Mockito and Vitest.
- Containers: Docker, Docker Compose and Nginx.

## Features

- User registration with BCrypt password hashing.
- Login with JWT authentication.
- Protected video game endpoints.
- Personal library with create, list and delete operations.
- Video game progress tracking.
- Error handling for invalid credentials.
- Responsive web interface.

## Security & run

GameVault uses JWT authentication to protect access to the user's game library.
Users register with an email address and a password, which is hashed using BCrypt.
After a successful login, the backend generates a signed JWT with an expiration time.
The frontend sends this token in the Authorization header when accessing protected endpoints.
Spring Security validates the token before allowing access to game data.
The backend includes automated tests for successful registration and duplicate email handling.
The frontend includes Vitest tests for successful login, invalid credentials and authenticated requests.
CORS allows the local React development server to communicate with the Spring Boot API.
Docker Compose runs the backend and frontend in separate containers connected through an internal network.
The frontend is available at http://localhost:8085 when running with Docker.

## Run locally

Backend:

1. Generate a secure JWT secret:

   `openssl rand -base64 32`

2. Create `backend/.env.local` containing `JWT_SECRET=your_generated_secret`.

3. Run:

   `cd backend`

   `set -a; source .env.local; set +a`

   `./mvnw spring-boot:run`

Frontend:

1. Create `frontend/.env.local` containing `VITE_API_URL=http://localhost:8082`.
2. Run `cd frontend`.
3. Run `npm ci`.
4. Run `npm run dev`.
5. Visit http://localhost:5173.

## Run with Docker

From the GameVault root directory:

`docker compose up --build -d`

Open http://localhost:8085.

To see running containers:

`docker compose ps`

To stop the application:

`docker compose down`

## Tests

Backend:

`cd backend && ./mvnw test`

Load `JWT_SECRET` into the shell first when required by the Spring application context.

Frontend:

`cd frontend && npm ci && npx vitest run`

## API endpoints

| Method | Endpoint | Authentication |
| ------ | -------- | -------------- |
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/videojuegos | JWT |
| POST | /api/videojuegos | JWT |
| DELETE | /api/videojuegos/{id} | JWT |

## Notes

H2 uses an in-memory database for this educational project.
Data may be lost when the backend or its container is restarted.
Never commit JWT secrets, passwords, local environment files or real authentication tokens.
