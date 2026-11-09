# Imagen del frontend (servidor estático en Node, sin dependencias)
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json server.js ./
COPY public ./public
COPY tests ./tests

USER node

EXPOSE 8080

CMD ["node", "server.js"]
