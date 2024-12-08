# Usa l'immagine ufficiale di Node.js come base
FROM node:20

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia il package.json e package-lock.json nella directory di lavoro
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutti i file del progetto nella directory di lavoro
COPY . .

# Costruisce il progetto React
RUN npm run build

# Espone la porta sulla quale il server React di sviluppo sarà in esecuzione (di solito la porta 3000)
EXPOSE 3000

# Comando per avviare il server di sviluppo React
CMD ["npm", "run", "react"]
