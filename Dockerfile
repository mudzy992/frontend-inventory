# Stage 1 - Koristi node:latest kao bazni image za izgradnju
FROM node:latest as build-stage

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /usr/src/app

# Kopiranje package.json i package-lock.json u radni direktorij
COPY package*.json ./

# Instalacija ovisnosti
RUN npm install --force

# Kopiranje cijele aplikacije
COPY . .

# Izgradnja aplikacije
RUN npm run build

# Stage 2 - Koristi node:alpine kao bazni image za produkciju
FROM node:alpine

# Instalacija serve globalno
RUN npm install -g serve

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "/usr/src/app/build", "-l", "5000"]
