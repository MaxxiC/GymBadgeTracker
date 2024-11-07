import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import MainBar from './MainBar';
import OldFiles from './OldFiles';

const AppPage = () => {
    const { t } = useTranslation();
    // Usa la variabile d'ambiente
    const apiUrl = process.env.REACT_APP_API_URL;

    const [selectedFiles, setSelectedFiles] = useState(null);
    const [sheetChoices, setSheetChoices] = useState([]); // Stato per mantenere i nomi dei fogli
    const [selectedSheet, setSelectedSheet] = useState({}); // Stato per memorizzare il foglio scelto per ogni file

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Stato per visualizzare la Modal di selezione sheet file


    // upload file
    const uploadFiles = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            console.error('Nessun file selezionato.');
            return;
        }

        const formData = new FormData();
        Array.from(selectedFiles).forEach(file => {
            formData.append('files', file);  // Aggiungi ogni file singolarmente a 'files'
        });

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Token non trovato nel localStorage");
            return;
        }


        try {
            const response = await fetch(`${apiUrl}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                console.log('File inviati con successo!');
            } else if (response.status === 401) {
                console.error('Non autorizzato. Effettua il login.');
                const errorData = await response.json();
                console.error('Errore dal server:', errorData.message);
                alert(errorData.message); // Opzionale, per mostrare un messaggio all'utente
            } else {
                console.error('Errore durante l\'invio dei file.');
                const errorData = await response.json();
                console.error('Errore dal server:', errorData.message);
                alert(errorData.message); // Opzionale, per mostrare un messaggio all'utente
            }
        } catch (error) {
            console.error('Errore durante la richiesta all\'API:', error);
        }

        setSelectedFiles(null);
    };

    // delete selected files
    const handleDeleteFile = (index) => {
        const updatedFiles = [...selectedFiles];
        updatedFiles.splice(index, 1);
        setSelectedFiles(updatedFiles);

        if (selectedFiles.length == 0) {
            setSelectedFiles(null);
        }
    };

    // drag & drop
    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        const isValidFileType = Array.from(droppedFiles).every(file =>
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel'
        );

        if (isValidFileType) {
            console.log('File inviati con successo!');
            console.log(droppedFiles[0].name);
            setSelectedFiles(droppedFiles);
        } else {
            console.error('Tipo di file non valido. Accettati solo file Excel.');
        }
    };

    return (
        <div className="container-fluid">
            <MainBar />
            {/* Main Content */}
            <div className='d-flex flex-column justify-content-center m-auto'>
                <div
                    className={`row div-drop ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop} >
                    <div className="col-12 d-flex flex-column  m-auto text-center align-items-center">
                        <h1 className='m-2'>{t('welcome')}</h1>
                        <h4 className='m-2 blockquote mb-5'>{t('subtitle')}</h4>

                        <div className="file-input-container" onClick={() => fileInputRef.current.click()} >
                            <label htmlFor="file-input" className="file-input-label">
                                <span className="file-input-icon">📂</span>
                                <span className="file-input-text">{t('chooseFile')}</span>
                            </label>
                            <input
                                type='file'
                                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                className="file-input"
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                ref={fileInputRef}
                                multiple
                            />
                        </div>
                        {selectedFiles && selectedFiles.length > 0 && (
                            <div className="selected-files text-white ">

                                <table>
                                    {
                                        (
                                            // Se è un array, usa il ciclo for
                                            (() => {
                                                const files = [];
                                                for (let i = 0; i < selectedFiles.length; i++) {
                                                    files.push(
                                                        <tr key={i}>
                                                            <td id={i} className='mx-1'>{selectedFiles[i].name}</td>
                                                            <td>
                                                                <button type="button" className="btn btn-danger mx-1" onClick={() => handleDeleteFile(i)} >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                                return files;
                                            })()
                                        )
                                    }
                                </table>
                                <button className='btn btn-link m-1' onClick={uploadFiles}>Invia Tutto</button>
                            </div>
                        )}


                        {/* Visualizza la modal di selezione foglio */}
                        {isModalOpen && (
                            <div className="modal">
                                <div className="modal-content">
                                    <h3>Seleziona un foglio per ciascun file:</h3>
                                    {sheetChoices.map((choice, idx) => (
                                        <div key={idx}>
                                            <label>{`File: ${choice.name}`}</label>
                                            <select
                                                value={selectedSheet[choice.name] || ''}
                                                onChange={(e) => handleSheetSelection(choice.name, e.target.value)}
                                            >
                                                <option value="">-- Seleziona un foglio --</option>
                                                {choice.sheetNames.map((sheet, index) => (
                                                    <option key={index} value={sheet}>{sheet}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                    <button onClick={submitWithSheetSelection}>Processa File con Foglio Selezionato</button>
                                    <button onClick={() => setIsModalOpen(false)}>Chiudi</button>
                                </div>
                            </div>
                        )}

                    </div>
                    <OldFiles />
                </div>
            </div>
        </div>
    );
};

export default AppPage;
