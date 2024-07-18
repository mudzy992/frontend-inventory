# Stage 1: Install dependencies and build the app
FROM node:18-alpine AS build-stage

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /usr/src/frontend/app

# Kopiranje package.json i package-lock.json u radni direktorij
COPY package*.json ./

# Instalacija ovisnosti
RUN npm install --force --verbose

# Kopiranje cijele aplikacije
COPY . .

# Instalacija serve globalno
RUN npm install -g serve --verbose

# Pokretanje npm run build sa više detalja
RUN npm run build --verbose

# Stage 2: Production image with only necessary files
FROM node:18-alpine

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /usr/src/frontend/app

# Kopiranje samo nužnih datoteka iz build-stage
COPY --from=build-stage /usr/src/frontend/app/package*.json ./
COPY --from=build-stage /usr/src/frontend/app/node_modules ./node_modules
COPY --from=build-stage /usr/src/frontend/app/build ./build

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "build", "-l", "5000"]
