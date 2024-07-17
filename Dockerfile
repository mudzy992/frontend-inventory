# Koristimo službeni Node.js image kao bazu
FROM node:18 as build-stage

# Kreiramo direktorij za aplikaciju unutar image-a
WORKDIR /usr/src/app

# Kopiramo package.json i package-lock.json u radni direktorij
COPY package*.json ./

# Instaliramo ovisnosti
RUN npm install --force

# Kopiramo ostatak aplikacije
COPY . .

# Izgradimo aplikaciju
RUN npm run build

# Stage 2 - koristimo serve za server

FROM node:18-alpine

# Instaliramo serve globalno
RUN npm install -g serve

# Kopiramo build iz prethodnog stage-a u radni direktorij za serve
COPY --from=build-stage /usr/src/app/build /usr/src/app/build

# Otvaramo port na kojem aplikacija radi
EXPOSE 5000

# Pokrećemo serve da poslužuje aplikaciju
CMD ["serve", "-s", "build", "-l", "5000"]
