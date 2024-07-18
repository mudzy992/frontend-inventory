# Stage 1: Install dependencies and build the app
FROM node:20-alpine AS dependencies

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /usr/src/app

# Kopiranje package.json i package-lock.json u radni direktorij
# COPY package*.json ./

# Kopiranje cijele aplikacije
COPY . .

# Instalacija ovisnosti
RUN npm install --force --silent

# Stage 2: Build
FROM dependencies AS build

# Kopiranje cijele aplikacije
COPY . .

# Instalacija serve globalno
RUN npm install -g serve --silent

# Pokretanje npm run build sa više detalja
RUN npm run build --verbose

# Stage 2: Production image with only necessary files
FROM node:20-alpine

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /usr/src/app

# Kopiranje samo nužnih datoteka iz build-stage
COPY --from=build /usr/src/app/package*.json /usr/src/app/
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/build /usr/src/app/build

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "build", "-l", "5000"]
