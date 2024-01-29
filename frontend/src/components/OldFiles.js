import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';


const OldFiles = () => {
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);

    useEffect(() => {
        // Funzione per ottenere i dati dall'API
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/files');
                const data = await response.json();
                setFiles(data.files);
            } catch (error) {
                console.error('Errore durante il recupero dei dati dall\'API', error);
            }
        };

        // Esegui fetchData iniziale
        fetchData();

        // Imposta un intervallo per eseguire fetchData ogni 3 secondi
        const intervalId = setInterval(fetchData, 3000);

        // Pulizia dell'intervallo quando il componente viene smontato
        return () => clearInterval(intervalId);
    }, []); // L'array vuoto assicura che l'effetto venga eseguito solo all'inizio


    const formatCreationDate = (creationDate) => {
        const today = new Date();
        const date = new Date(creationDate);

        if (isSameDay(date, today)) {
            // Se è della stessa ora, confronta i minuti
            if (isSameHour(date, today)) {
                const minutesAgo = Math.floor((today - date) / (1000 * 60));
                return `${minutesAgo}m fa`;
            }

            // Altrimenti, mostra "x ore fa"
            const hoursAgo = Math.floor((today - date) / (1000 * 60 * 60));
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
                                <td className='mx-1'>Link</td>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map(file => (
                                <tr id={file.id}>
                                    <td className='mx-1'>{file.name}</td>
                                    <td className='mx-1'>{formatCreationDate(file.creationDate)}</td>
                                    <td className='mx-1'><a href={`http://localhost:3001${file.downloadUrlModificato}`} className="btn btn-primary" download>
                                        <i className="bi bi-download "></i>
                                    </a></td>
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
