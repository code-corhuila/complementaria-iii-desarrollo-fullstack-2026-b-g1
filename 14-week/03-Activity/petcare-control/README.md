# PetCare Control

PetCare Control is a full-stack veterinary management application developed with React, TypeScript, Node.js, and Express.

The application allows authenticated users to view registered pets and upcoming veterinary appointments.

## Technologies

- **Frontend:** React, TypeScript, Vite, Nginx.
- **Backend:** Node.js, Express, JSON Web Tokens (JWT), bcryptjs.
- **Testing:** Vitest, React Testing Library, Supertest.
- **Containerization:** Docker.

## Security & run

PetCare Control uses JSON Web Tokens (JWT) to protect private API endpoints. Users must register and log in before accessing pet and appointment information. Passwords are hashed using bcryptjs instead of being stored as plain text. The backend validates JWT tokens and returns HTTP 401 when authentication is missing or invalid. CORS is configured to control which frontend origin may access the backend directly. The JWT secret is loaded from environment variables and must never be committed to GitHub. The application can run locally or through Docker containers. The current demonstration stores users in memory, so registered accounts are lost whenever the backend restarts.

### Environment variables

Create a `backend/.env` file containing:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=replace-with-a-random-secret-of-at-least-32-characters
```

Use a cryptographically random JWT secret. Never publish your actual `.env` file.

### Run locally

Start the backend:

```bash
cd backend
npm ci
node server.js
```

Start the frontend in another terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL displayed by Vite. Ensure `FRONTEND_URL` matches that URL's origin when running the backend directly.

### Run with Docker

Build the images:

```bash
docker build -t petcare-backend ./backend
docker build -t petcare-frontend ./frontend
```

Create a network and run the backend:

```bash
docker network create petcare-network
docker run -d --name petcare-api --network petcare-network -p 3001:3000 --env-file ./backend/.env petcare-backend
```

Run the frontend:

```bash
docker run -d --name petcare-web --network petcare-network -p 8085:80 petcare-frontend
```

Open http://localhost:8085.

The Nginx container serves the React application and forwards `/api` requests to the Express backend through the Docker network.

### Register a test user

After starting the backend, register an account using `POST /api/auth/register` with a valid email and a password of at least eight characters. Then enter the registered credentials in the login form.

### Automated tests

Run backend tests:

```bash
cd backend
npx vitest run
```

Run frontend tests:

```bash
cd frontend
npx vitest run
npm run build
```

The automated tests cover protected backend endpoints, authentication failures, login form rendering, and displaying pets and appointments.

## Main endpoints

| Method | Endpoint | Authentication |
|---|---|---|
| GET | `/api/health` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/pets` | Bearer JWT |
| GET | `/api/appointments` | Bearer JWT |

## Academic project

Developed as an individual Week 14 Fullstack assignment at CORHUILA.
