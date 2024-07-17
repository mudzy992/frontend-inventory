# Stage 1 - Koristi node:latest kao bazni image za izgradnju
FROM node:18-alpine

# Postavljanje radnog direktorija za aplikaciju unutar image-a
WORKDIR /usr/src/app

# Kopiranje package.json i package-lock.json u radni direktorij
COPY package*.json ./

# Instalacija ovisnosti
RUN npm install --force

# Instalacija serve globalno
RUN npm install -g serve

# Instalacija react-scripts globalno
RUN npm install -g react-scripts

# Kopiranje cijele aplikacije
COPY . .

# Izgradnja aplikacije
RUN npm run build

# Otvori port na kojem će aplikacija raditi
EXPOSE 5000

# Pokretanje serve za posluživanje aplikacije
CMD ["serve", "-s", "build", "-l", "5000"]
