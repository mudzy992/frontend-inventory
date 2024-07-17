# Stage 1 - Koristi node:latest kao bazni image za izgradnju
FROM node:18-alpine

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /usr/src/app

# Kopiranje package.json i package-lock.json u radni direktorij
COPY package*.json ./

# Instalacija ovisnosti
RUN npm install --force --verbose

# Instalacija serve globalno
RUN npm install -g serve --verbose

# Kopiranje cijele aplikacije
COPY . .

# Izgradnja aplikacije sa dodatnim logovanjem
RUN yarn run build --verbose

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "build", "-l", "5000"]
