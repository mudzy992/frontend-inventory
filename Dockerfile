# Stage 1: Build the app
FROM node:20-alpine AS build-stage

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /app

# Kopiranje package.json i package-lock.json u radni direktorij
COPY package*.json ./

# Instalacija ovisnosti
RUN npm install --force --silent

# Kopiranje cijele aplikacije
COPY . .

# Pokretanje npm run build sa više detalja
RUN npm run build --verbose

# Stage 2: Production image
FROM node:20-alpine

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /app

# Kopiramo izgrađene datoteke iz build-stage
COPY --from=build-stage /app/build /app/build

# Instalacija serve globalno
RUN npm install -g serve --silent

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "build", "-l", "5000"]
