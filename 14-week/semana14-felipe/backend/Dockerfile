# Imagen de la API (Node + Express + JWT)
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# 1) Dependencias primero (aprovecha la caché de Docker)
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# 2) Código fuente y pruebas
COPY src ./src
COPY tests ./tests

# No correr como root
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "src/server.js"]
