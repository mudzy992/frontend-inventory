# Stage 1 - Koristi node:18-alpine kao bazni image za izgradnju
FROM node:18-alpine AS build-stage

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /usr/src/app

# Kopiranje package.json i package-lock.json u radni direktorij
COPY package*.json ./

# Instalacija ovisnosti
RUN npm install --force --verbose

# Kopiranje cijele aplikacije
COPY . .

# Instalacija serve globalno
RUN npm install -g serve --verbose

# Pokrećemo npm run build sa više detalja
RUN npm run build --verbose

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "/usr/src/app/build", "-l", "5000"]
