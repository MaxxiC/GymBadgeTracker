#!/bin/bash

# Configurazione variabili
PROJECT_NAME="gym-badge-tracker-frontend"
REMOTE_USER="tuo-utente"          # Sostituisci con il tuo utente SSH
REMOTE_HOST="tuo-host"            # Sostituisci con il tuo indirizzo host
REMOTE_PATH="/home/tuo-utente/"   # Directory remota dove copiare l'immagine
DOCKERFILE_PATH="."               # Path dove si trova il Dockerfile

# Creazione del tag progressivo basato su data e ora
#TAG=$(date +"%Y%m%d-%H%M%S")
TAG="0.1"
IMAGE_NAME="${PROJECT_NAME}:${TAG}"
TAR_FILE="${PROJECT_NAME}-${TAG}.tar"

echo "--Creazione immagine Docker per React con tag: ${IMAGE_NAME}"

# Costruisce i file statici React
echo "--Esecuzione di npm build per il progetto React..."
npm run build
if [ $? -ne 0 ]; then
  echo "--Errore durante la build del progetto React."
  exit 1
fi

# Crea l'immagine Docker
docker build -t "${IMAGE_NAME}" "${DOCKERFILE_PATH}"
if [ $? -ne 0 ]; then
  echo "--Errore durante la creazione dell'immagine Docker."
  exit 1
fi

echo "--Salvataggio dell'immagine Docker in un file tar: ${TAR_FILE}"
docker save -o "${TAR_FILE}" "${IMAGE_NAME}"
if [ $? -ne 0 ]; then
  echo "--Errore durante il salvataggio dell'immagine Docker."
  exit 1
fi

echo "--Trasferimento del file tar al server remoto: ${REMOTE_HOST}"
scp "${TAR_FILE}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
if [ $? -ne 0 ]; then
  echo "--Errore durante il trasferimento del file al server remoto."
  exit 1
fi

echo "--Pulizia file tar locale..."
rm -f "${TAR_FILE}"

echo "--Immagine Docker trasferita con successo. Ora puoi caricarla ed eseguirla sul server remoto!"
echo "--Ricorda di accedere al server e caricare l'immagine con:"
echo "--docker load -i ${REMOTE_PATH}${TAR_FILE}"
