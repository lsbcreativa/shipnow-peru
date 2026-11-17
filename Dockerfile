FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src

# uploads/ y logs/ los crea la app sola la primera vez que los necesita
# (ver src/config/upload.config.js y src/config/logger.config.js), pero el
# usuario "node" (no root) necesita permiso de escritura en /app para eso
RUN mkdir -p uploads logs && chown -R node:node /app

EXPOSE 8080

USER node

CMD ["node", "src/server.js"]
