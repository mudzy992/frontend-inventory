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

# Provera sadržaja build direktorija
RUN ls -la /usr/src/app/build

# Stage 2 - Koristi node:alpine kao bazni image za produkciju
FROM node:18-alpine

# Instalacija serve globalno
RUN npm install -g serve

# Kopiranje build direktorija iz prvog stadijuma
COPY --from=build-stage /usr/src/app/build /usr/src/app/build

# Provera sadržaja build direktorija
RUN ls -la /usr/src/app/build

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "/usr/src/app/build", "-l", "5000"]
