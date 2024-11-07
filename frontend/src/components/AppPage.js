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

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [sheetChoices, setSheetChoices] = useState([]); // Stato per mantenere i nomi dei fogli
    const [selectedSheet, setSelectedSheet] = useState({}); // Stato per memorizzare il foglio scelto per ogni file

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Funzione generica per inviare una richiesta al backend
    const sendRequest = async (formData) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Token non trovato nel localStorage");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const result = await response.json();
            return { response, result };
        } catch (error) {
            console.error('Errore durante la richiesta all\'API:', error);
            return { error };
        }
    };

    // Caricamento file
    const uploadFiles = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            console.error('Nessun file selezionato.');
            return;
        }

        const formData = new FormData();
        Array.from(selectedFiles).forEach(file => formData.append('files', file));

        const { response, result, error } = await sendRequest(formData);
        if (error) return;

        if (response.ok) {
            const filesWithMultipleSheets = result.files.filter(file => file.sheetNames && file.sheetNames.length > 1);
            if (filesWithMultipleSheets.length > 0) {
                setSheetChoices(filesWithMultipleSheets.map(file => ({
                    name: file.originalname,
                    sheetNames: file.sheetNames,
                })));
                setIsModalOpen(true);
            } else {
                console.log('File inviati e processati con successo!', result);
                setSelectedFiles([]); // Svuota la lista dei file al termine
                setSheetChoices([]);
            }
        } else {
            console.error('Errore durante l\'invio dei file:', result.message);
            alert(result.message);
        }
    };

    // Invio file con nome del foglio selezionato
    const submitWithSheetSelection = async () => {
        if (!selectedFiles) {
            console.error('Nessun file selezionato.');
            return;
        }

        const formData = new FormData();
        Array.from(selectedFiles).forEach(file => formData.append('files', file));

        for (const choice of sheetChoices) {
            const selectedSheetName = selectedSheet[choice.name];
            if (!selectedSheetName) continue;
            formData.append('selectedSheetName', selectedSheetName);

            const { response, result, error } = await sendRequest(formData);
            if (error) return;

            if (response.ok) {
                console.log(`File ${choice.name} processato con il foglio ${selectedSheetName} selezionato con successo!`);
            } else {
                console.error('Errore durante il processamento del file:', result.message);
                alert(result.message);
            }
        }

        setSelectedFiles([]); // Svuota la lista dei file al termine
        setIsModalOpen(false); // Chiudi la modal
    };

    // Gestione selezione foglio
    const handleSheetSelection = (fileName, sheetName) => {
        setSelectedSheet({
            ...selectedSheet,
            [fileName]: sheetName
        });
    };

    // Elimina file selezionato
    const handleDeleteFile = (index) => {
        const updatedFiles = [...selectedFiles];
        updatedFiles.splice(index, 1);
        setSelectedFiles(updatedFiles.length ? updatedFiles : null);
    };

    // Funzioni di drag & drop
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

        const droppedFiles = Array.from(e.dataTransfer.files);
        const isValidFileType = droppedFiles.every(file =>
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel'
        );

        if (isValidFileType) {
            setSelectedFiles(prevFiles => [...prevFiles, ...droppedFiles]);
        } else {
            console.error('Tipo di file non valido. Accettati solo file Excel.');
        }
    };

    const handleFileInputChange = (e) => {
        const newFiles = Array.from(e.target.files); // Converti i file in array
        // Assicurati che selectedFiles sia sempre un array e aggiungi i nuovi file
        setSelectedFiles(prevFiles => {
            if (!prevFiles) {
                return newFiles; // Se prevFiles è undefined o null, crea un nuovo array
            }
            return [...prevFiles, ...newFiles]; // Altrimenti aggiungi i nuovi file all'array esistente
        });
    };



    return (
        <div className="container-fluid">
            <MainBar />
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
                                onChange={handleFileInputChange}  // Usa la nuova funzione qui
                                ref={fileInputRef}
                                multiple
                            />
                        </div>
                        {selectedFiles && selectedFiles.length > 0 && (
                            <div className="selected-files text-white ">
                                <table>
                                    {Array.from(selectedFiles).map((file, i) => (
                                        <tr key={i}>
                                            <td id={i} className='mx-1'>{file.name}</td>
                                            <td>
                                                <button type="button" className="btn btn-danger mx-1" onClick={() => handleDeleteFile(i)} >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </table>
                                <button className='btn btn-link m-1' onClick={uploadFiles}>Invia Tutto</button>
                            </div>
                        )}

                        {/* Modal di Bootstrap */}
                        <div className={`modal fade ${isModalOpen ? 'show' : ''}`} style={{ display: isModalOpen ? 'block' : 'none' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Seleziona un foglio per ciascun file:</h5>
                                        <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        {sheetChoices.map((choice, idx) => (
                                            <div key={idx}>
                                                <label>{`File: ${choice.name}`}</label>
                                                <select
                                                    className="form-select mt-2 mb-3"
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
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-primary" onClick={submitWithSheetSelection}>Processa File</button>
                                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Chiudi</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isModalOpen && <div className="modal-backdrop fade show"></div>}
                    </div>
                    <OldFiles />
                </div>
            </div>
        </div>
    );
};

export default AppPage;
