import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';


const OldFiles = () => {
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;


    // Funzione per ottenere i dati dall'API
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token'); // Recupera il token JWT
            if (!token) {
                console.error('Token di autenticazione non trovato.');
                return;
            }

            const response = await fetch(`${apiUrl}/files`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Invia il token nell'header Authorization
                    'Content-Type': 'application/json'
                }
            });

            // Verifica se la risposta è ok (status 200)
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Non autorizzato. Effettua di nuovo il login.');
                    // Aggiungi qui eventuale gestione del logout o reindirizzamento al login
                } else {
                    console.error('Errore durante la richiesta: ', response.status);
                }
                return;
            }

            const data = await response.json();
            setFiles(data.files);
        } catch (error) {
            console.error('Errore durante il recupero dei dati dall\'API:', error);
        }
    };


    useEffect(() => {
        // Esegui fetchData iniziale
        fetchData();

        // Imposta un intervallo per eseguire fetchData ogni 3 secondi
        const intervalId = setInterval(fetchData, 3000);

        // Pulizia dell'intervallo quando il componente viene smontato
        return () => clearInterval(intervalId);
    }, []); // L'array vuoto assicura che l'effetto venga eseguito solo all'inizio





    const handleDownload = async (fileId) => {
        try {
            const token = localStorage.getItem('token');

            // Primo fetch per ottenere nome e dati del file
            const response = await fetch(`${apiUrl}/download/${fileId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Ricevi il nome del file dall'intestazione o JSON del server
                const disposition = response.headers.get('Content-Disposition');
                let fileName = 'file_modificato.xlsx';

                if (disposition) {
                    console.log(disposition);
                    fileName = disposition.split('filename=')[1]?.replace(/"/g, '') || 'file_modificato.xlsx';
                    console.log(fileName);
                } else {
                    console.error('Intestazione Content-Disposition non trovata');
                }

                // const fileName = disposition ? disposition.split('filename=')[1].replace(/"/g, '')
                //     : 'file_modificato.xlsx';

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
                console.log('Download riuscito!');
            } else {
                console.error('Errore durante il download del file.');
            }
        } catch (error) {
            console.error('Errore durante il download del file:', error);
        }
    };





    const catchDelete = (fileId) => {
        const userConfirmed = window.confirm(`Vuoi davvero procedere all'eliminazione?`);
        if (userConfirmed) {
            // Logica per l'azione di conferma
            handleDelete(fileId);
        }
    };

    const handleDelete = async (fileId) => {
        try {
            const token = localStorage.getItem('token');

            // Primo fetch per ottenere nome e dati del file
            const response = await fetch(`${apiUrl}/delete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' // Aggiungi questa intestazione per indicare JSON
                },
                body: JSON.stringify({
                    fileId_todelete: fileId // Serializza l'oggetto come stringa JSON
                })
            });

            if (response.ok) {
                // Esegui fetchData iniziale
                fetchData();
                console.log('Eliminazione del file riuscita!');
            } else {
                console.error('Errore durante la delete del file.');
            }
        } catch (error) {
            console.error('Errore durante la delete del file:', error);
        }
    };





    const formatCreationDate = (creationDate) => {
        const today = new Date();
        const date = new Date(creationDate);

        if (isSameDay(date, today)) {
            const timeDifferenceInMinutes = Math.floor((today - date) / (1000 * 60));

            // Se è della stessa ora, mostra "x minuti fa"
            if (timeDifferenceInMinutes < 60) {
                return `${timeDifferenceInMinutes}m fa`;
            }

            // Se è meno di 24 ore fa ma più di 60 minuti, mostra "x ore fa"
            const hoursAgo = Math.floor(timeDifferenceInMinutes / 60);
            return `${hoursAgo}h fa`;
        } else if (isSameDay(date, new Date(today.getTime() - 24 * 60 * 60 * 1000))) {
            // Ieri, mostra "Ieri"
            return 'Ieri';
        } else {
            // In tutti gli altri casi, mostra la data normale
            return date.toISOString().split('T')[0];
        }
    };

    const isSameHour = (date1, date2) => {
        return (
            date1.getHours() === date2.getHours() &&
            date1.getMinutes() === date2.getMinutes()
        );
    };

    const isSameDay = (date1, date2) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };




    return (
        <>
            {files && files.length > 0 &&
                <div className='col-12 d-flex flex-column m-auto text-center align-items-center'>
                    <h3>File caricati precedentemente</h3>
                    <table className="table table-dark table-striped tbl-m">
                        <thead>
                            <tr>
                                <td className='mx-1'>Name</td>
                                <td className='mx-1'>Date</td>
                                <td className='mx-1'>Download</td>
                                <td className='mx-1'>Delete</td>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map(file => (
                                <tr key={file.created_at}>
                                    <td className='mx-1'>{file.file_name}</td>
                                    <td className='mx-1'>{formatCreationDate(file.created_at)}</td>
                                    <td className='mx-1'><button onClick={() => handleDownload(file._id)} className="btn btn-primary" >
                                        <i className="bi bi-download "></i>
                                    </button></td>
                                    <td className='mx-1'><button onClick={() => catchDelete(file._id)} className="btn btn-danger" >
                                        <i className="bi bi-trash "></i>
                                    </button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
        </>
    );
};

export default OldFiles;
