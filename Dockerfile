# Koristimo službeni Node.js image kao bazu
FROM node:14

# Kreiramo direktorij za aplikaciju unutar image-a
WORKDIR /usr/src/app

# Kopiramo package.json i package-lock.json u radni direktorij
COPY package*.json ./

# Instaliramo ovisnosti
RUN npm install

# Kopiramo ostatak aplikacije
COPY . .

# Izgradimo aplikaciju
RUN npm run build

# Instaliramo nginx
RUN apt-get update && apt-get install -y nginx

# Kopiramo build u nginx-ov root direktorij
RUN cp -r build/* /var/www/html/

# Otvaramo port na kojem aplikacija radi
EXPOSE 4001

# Pokrećemo nginx
CMD ["nginx", "-g", "daemon off;"]
