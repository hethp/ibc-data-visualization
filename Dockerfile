FROM node:18-alpine

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy and build server
COPY server/ ./server/
RUN cd server && npm run build

# Copy platform static files (served by Express)
COPY platform/ ./platform/

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server/dist/index.js"]
