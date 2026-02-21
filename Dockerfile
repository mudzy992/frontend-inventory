# Stage 1: build
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --force --silent
COPY . .
RUN npm run build --verbose

# Stage 2: production
FROM node:20-alpine
WORKDIR /app
COPY --from=build-stage /app/dist /app/dist
RUN npm install -g serve --silent

# Storage mount
VOLUME ["/app/storage"]

EXPOSE 5000
CMD ["serve", "-s", "dist", "-l", "5000"]
