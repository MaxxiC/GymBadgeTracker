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

    const [availableFilters, setAvailableFilters] = useState([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([]); // Stato per memorizzare i filtri del file scelti
    const [useFilters, setUseFilters] = useState(true); // Stato per capire se i filtri sono stati selezioni e/o non usati

    const [sheetNamesMap, setSheetNamesMap] = useState({}); // Mappa dei nomi dei fogli
    const [allSheetsSelected, setAllSheetsSelected] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false); //old modal da cancellare selezione sheet

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



    // Invio file con nome del foglio selezionato
    const chooseFilters = async () => {
        if (!selectedFiles) {
            console.error('Nessun file selezionato.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Token non trovato nel localStorage");
            return;
        }

        const formData = new FormData();
        Array.from(selectedFiles).forEach(file => {
            formData.append('files', file);
            const selectedSheet = sheetNamesMap[file.name];
            formData.append('sheetNames', selectedSheet); // Aggiunge il nome del foglio selezionato
        });

        try {
            const response = await fetch(`${apiUrl}/getFilters`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error("Errore nella risposta del server");
            }

            const filters = await response.json();
            setAvailableFilters(filters); // Salva i filtri disponibili nel state
            openFilterModal(); // Apre la modale per la selezione dei filtri

        } catch (error) {
            console.error("Errore nel caricamento dei filtri:", error);
        }
    };


    // Elimina file selezionato
    const handleDeleteFile = (index) => {
        const updatedFiles = [...selectedFiles];
        const [removedFile] = updatedFiles.splice(index, 1);
        setSelectedFiles(updatedFiles.length ? updatedFiles : null);

        // Rimuovi anche la selezione del foglio dalla mappa
        const updatedSheetNamesMap = { ...sheetNamesMap };
        delete updatedSheetNamesMap[removedFile.name];
        setSheetNamesMap(updatedSheetNamesMap);

        checkAllSheetsSelected(updatedSheetNamesMap);
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

        // Inizializza sheetNamesMap senza nomi di fogli
        const initialSheetNamesMap = {};
        newFiles.forEach(file => {
            initialSheetNamesMap[file.name] = null; // Nessun foglio selezionato inizialmente
        });
        setSheetNamesMap(initialSheetNamesMap);
    };


    const handleLoadSheets = async (file) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("Token non trovato nel localStorage");
                return;
            }
            //const buffer = await file.arrayBuffer(); // Converte il file in un buffer

            const formData = new FormData();
            formData.append('file', file);

            // Invia il buffer al backend
            const response = await fetch(`${apiUrl}/getSheetNames`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const result = await response.json();

            const newSheetNamesMap = { ...sheetNamesMap };
            if (result.length === 1) {
                // Se c'è un solo foglio, selezionalo automaticamente
                newSheetNamesMap[file.name] = result[0];
            } else {
                // Se ci sono più fogli, salva le opzioni ma nessuna selezione
                newSheetNamesMap[file.name] = result;
            }
            setSheetNamesMap(newSheetNamesMap);
            checkAllSheetsSelected(newSheetNamesMap);

        } catch (error) {
            console.error("Errore nel caricamento dei fogli:", error);
        }
    };

    const handleSelectSheet = (fileName, sheetName) => {
        // Aggiorna sheetNamesMap con la selezione del foglio
        const newSheetNamesMap = { ...sheetNamesMap };
        newSheetNamesMap[fileName] = sheetName;
        setSheetNamesMap(newSheetNamesMap);
        checkAllSheetsSelected(newSheetNamesMap);
    };

    const checkAllSheetsSelected = (map) => {
        // Verifica se tutti i file hanno un foglio selezionato
        const allSelected = Object.values(map).every(value => value !== null && typeof value === 'string');
        setAllSheetsSelected(allSelected);
    };




    //modale selezione filtri
    const openFilterModal = () => setIsFilterModalOpen(true);
    const closeFilterModal = () => setIsFilterModalOpen(false);

    // Gestisce l'aggiunta o la rimozione di un filtro selezionato
    const toggleFilter = (filter) => {
        setSelectedFilters(prevFilters =>
            prevFilters.includes(filter)
                ? prevFilters.filter(f => f !== filter)
                : [...prevFilters, filter]
        );
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
                                            <td className='mx-1 border-1'>{file.name}</td>
                                            <td className='mx-1 border-1'>
                                                {sheetNamesMap[file.name] === null ? (
                                                    // Mostra il pulsante "Load fogli" se il foglio non è ancora caricato
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={() => handleLoadSheets(file)}
                                                    >
                                                        Load fogli
                                                    </button>
                                                ) : Array.isArray(sheetNamesMap[file.name]) ? (
                                                    // Mostra una tendina se ci sono più fogli
                                                    <select
                                                        onChange={(e) => handleSelectSheet(file.name, e.target.value)}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Seleziona un foglio</option>
                                                        {sheetNamesMap[file.name].map((sheet, index) => (
                                                            <option key={index} value={sheet}>{sheet}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    // Mostra il nome del foglio se già selezionato
                                                    sheetNamesMap[file.name]
                                                )}
                                            </td>
                                            <td>
                                                <button type="button" className="btn btn-danger mx-1" onClick={() => handleDeleteFile(i)} >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </table>
                                <button className='btn btn-link m-1' onClick={chooseFilters} disabled={!allSheetsSelected}>{selectedFilters.length > 0 ? 'Cambia Filtri' : 'Scegli Filtri'}</button>
                                <button
                                    className='btn btn-link m-1'
                                    onClick={uploadFiles}
                                    disabled={useFilters || selectedFilters.length > 0} // Disabilita se "useFilters" è falso o "selectedFilters" è vuoto
                                > Invia Tutto</button>
                            </div>
                        )}

                        {/* Modal di Bootstrap */}
                        {isFilterModalOpen && (
                            <>
                                <div className={`modal fade ${isFilterModalOpen ? 'show' : ''}`} style={{ display: isFilterModalOpen ? 'block' : 'none' }} aria-labelledby="filterModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="filterModalLabel">Seleziona i Filtri</h5>
                                                <button type="button" className="btn-close" onClick={closeFilterModal}></button>
                                            </div>
                                            <div className="modal-body">
                                                <ul>
                                                    {availableFilters.map((filter, index) => (
                                                        <li key={index}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedFilters.includes(filter)}
                                                                    onChange={() => toggleFilter(filter)}
                                                                />
                                                                {filter}
                                                            </label>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="modal-footer">
                                                <button className="btn btn-secondary" onClick={closeFilterModal}>Annulla</button>
                                                <button className="btn btn-primary" onClick={closeFilterModal}>Conferma</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Backdrop */}
                                <div className="modal-backdrop fade show"></div>
                            </>
                        )}
                    </div>
                    <OldFiles />
                </div>
            </div>
        </div>
    );
};

export default AppPage;
