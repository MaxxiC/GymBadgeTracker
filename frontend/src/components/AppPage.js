import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import MainBar from './MainBar';
import OldFiles from './OldFiles';

const AppPage = () => {
    const { t } = useTranslation();

    const [selectedFiles, setSelectedFiles] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // upload file
    const uploadFiles = async () => {
        if (!selectedFiles) {
            console.error('Nessun file selezionato.');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }

        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            });

            // Gestisci la risposta dell'API
            if (response.ok) {
                console.log('File inviati con successo!');
            } else {
                console.error('Errore durante l\'invio dei file.');
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

        if(selectedFiles.length == 0){
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
                                                        <tr>
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

                    </div>
                    <OldFiles />
                </div>
            </div>
        </div>
    );
};

export default AppPage;
