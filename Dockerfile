# Stage 1 - Koristi node:latest kao bazni image za izgradnju
FROM node:latest AS build-stage

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /usr/src/app

# Kopiranje package.json i package-lock.json u radni direktorij
COPY package*.json ./

# Instalacija ovisnosti
RUN npm install --force --verbose

# Prikazivanje trenutnog radnog direktorija i fajlova
RUN pwd && ls -la

# Kopiranje cijele aplikacije
COPY . .

# Prikazivanje fajlova nakon kopiranja
RUN ls -la

# Pokrećemo npm run build sa više detalja
RUN npm run build --verbose

# Provera sadržaja build direktorija nakon build-a
RUN ls -la /usr/src/app/build

# Stage 2 - Koristi node:alpine kao bazni image za produkciju
FROM node:alpine

# Instalacija serve globalno
RUN npm install -g serve

# Kopiranje build direktorija iz prvog stadijuma
COPY --from=build-stage /usr/src/app/build /usr/src/app/build

# Provera sadržaja build direktorija nakon kopiranja
RUN ls -la /usr/src/app/build

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "/usr/src/app/build", "-l", "5000"]
