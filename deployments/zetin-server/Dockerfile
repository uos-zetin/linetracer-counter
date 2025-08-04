# Server build stage
FROM node:22-alpine AS server-builder
WORKDIR /workspace
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Client build stage
FROM node:22-alpine AS client-builder
WORKDIR /workspace
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
ENV VITE_SERVER_URL=https://counter.zetin.uos.ac.kr
RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY --from=server-builder /workspace/build ./
COPY --from=client-builder /workspace/dist ./static
EXPOSE 3000
CMD ["node", "/app/src/index.js"]
