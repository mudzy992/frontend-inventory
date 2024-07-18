# Stage 1: Install dependencies and build the app
FROM node:20-alpine AS build-stage

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /app

# Kopiranje package.json i package-lock.json u radni direktorij
COPY package*.json /app

# Instalacija ovisnosti
RUN npm install --force --silent
# Kopiranje cijele aplikacije

COPY . /app

# Instalacija serve globalno
RUN npm install -g serve --silent

# Pokretanje npm run build sa više detalja
RUN npm run build --verbose

COPY --from=build-stage /app/build/ /app/build/

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "build", "-l", "5000"]


