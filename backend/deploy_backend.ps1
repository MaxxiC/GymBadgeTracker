# Configurazione variabili
$ProjectName = "gym-badge-tracker-backend"
$RemoteUser = "tuo-utente"          # Sostituisci con il tuo utente SSH
$RemoteHost = "tuo-host"            # Sostituisci con il tuo indirizzo host
$RemotePath = "/home/tuo-utente/"   # Directory remota dove copiare l'immagine
$DockerfilePath = "."               # Path dove si trova il Dockerfile

# Creazione del tag progressivo basato su data e ora
$Tag = "0.1"
$ImageName = "${ProjectName}:${Tag}"
$TarFile = "${ProjectName}-${Tag}.tar"

Write-Host "--Creazione immagine Docker con tag: $ImageName"

# Costruzione dell'immagine Docker
docker build -t $ImageName $DockerfilePath
if ($LASTEXITCODE -ne 0) {
    Write-Host "--Errore durante la creazione dell'immagine Docker."
    exit 1
}

Write-Host "--Salvataggio dell'immagine Docker in un file tar: $TarFile"

# Salvataggio dell'immagine Docker in un file tar
docker save -o $TarFile $ImageName
if ($LASTEXITCODE -ne 0) {
    Write-Host "--Errore durante il salvataggio dell'immagine Docker."
    exit 1
}

Write-Host "--Trasferimento del file tar al server remoto: $RemoteHost"

# Trasferimento del file tar al server remoto tramite SCP
scp $TarFile "${RemoteUser}@${RemoteHost}:${RemotePath}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "-- Errore durante il trasferimento del file al server remoto."
    exit 1
}

Write-Host "--Pulizia file tar locale..."

# Pulizia file tar locale
Remove-Item -Force $TarFile

Write-Host "--Immagine Docker trasferita con successo. Ora puoi caricarla ed eseguirla sul server remoto!"
Write-Host "--Ricorda di accedere al server e caricare l'immagine con:"
Write-Host "--docker load -i ${RemotePath}${TarFile}"
