# Stage 1 - Koristi node:18-alpine kao bazni image za izgradnju
FROM node:18-alpine AS build-stage

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /usr/src/app

# Kopiranje package.json i package-lock.json u radni direktorij
COPY package*.json ./

# Instalacija ovisnosti
RUN npm install --force --verbose

# Provera sadržaja direktorijuma
RUN echo "Sadržaj direktorijuma nakon instalacije ovisnosti:" && ls -la

# Kopiranje cijele aplikacije
COPY . .

# Provera sadržaja direktorijuma nakon kopiranja aplikacije
RUN echo "Sadržaj direktorijuma nakon kopiranja aplikacije:" && ls -la

# Dodavanje vremena čekanja (privremeno)
RUN sleep 10

# Pokrećemo npm run build sa više detalja
RUN npm run build --verbose

# Provera sadržaja build direktorija nakon build-a
RUN echo "Sadržaj build direktorija nakon build-a:" && ls -la /usr/src/app/build

# Pokrećemo npm run build sa više detalja
RUN npm run build --verbose

# Instalacija serve globalno
RUN npm install -g serve

# Provera sadržaja build direktorija nakon kopiranja
RUN echo "Sadržaj build direktorija nakon kopiranja:" && ls -la /usr/src/app/build

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "/usr/src/app/build", "-l", "5000"]
