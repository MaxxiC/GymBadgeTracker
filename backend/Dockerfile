# Usa un'immagine base ufficiale di Node.js
FROM node:20

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia i file package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutti i file del progetto nella directory di lavoro del container
COPY . .

# Escludi i file elencati in .dockerignore

# Espone la porta usata dalla tua app
EXPOSE 3001

# Definisce il comando per avviare l'app
CMD ["node", "index.js"]
