# Configurazione variabili
$projectName = "gym-badge-tracker-frontend"
$remoteUser = "tuo-utente"        # Sostituisci con il tuo utente SSH
$remoteHost = "tuo-host"          # Sostituisci con il tuo indirizzo host
$remotePath = "/home/tuo-utente/" # Directory remota dove copiare l'immagine
$dockerfilePath = "."             # Path dove si trova il Dockerfile

# Creazione del tag progressivo basato su data e ora
$tag = "0.1"
$imageName = "${projectName}:${tag}"
$tarFile = "${projectName}-${tag}.tar"

Write-Host "--Creazione immagine Docker per React con tag: $imageName"

# Costruisce i file statici React
Write-Host "--Esecuzione di npm build per il progetto React..."
npm run build
if ($?) {
    Write-Host "--Build completata con successo!"
} else {
    Write-Host "--Errore durante la build del progetto React."
    exit 1
}

# Crea l'immagine Docker
Write-Host "--Creazione dell'immagine Docker..."
docker build -t $imageName $dockerfilePath
if ($?) {
    Write-Host "--Immagine Docker creata con successo!"
} else {
    Write-Host "--Errore durante la creazione dell'immagine Docker."
    exit 1
}

Write-Host "--Salvataggio dell'immagine Docker in un file tar: $tarFile"
docker save -o $tarFile $imageName
if ($?) {
    Write-Host "--Immagine salvata con successo!"
} else {
    Write-Host "--Errore durante il salvataggio dell'immagine Docker."
    exit 1
}

Write-Host "--Trasferimento del file tar al server remoto: $remoteHost"
scp $tarFile "${remoteUser}@${remoteHost}:${remotePath}"
if ($?) {
    Write-Host "--File tar trasferito con successo!"
} else {
    Write-Host "--Errore durante il trasferimento del file al server remoto."
    exit 1
}

Write-Host "--Pulizia file tar locale..."
Remove-Item $tarFile -Force

Write-Host "--Immagine Docker trasferita con successo. Ora puoi caricarla ed eseguirla sul server remoto!"
Write-Host "--Ricorda di accedere al server e caricare l'immagine con:"
Write-Host "--docker load -i $remotePath$tarFile"
