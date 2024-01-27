// components/AppPage.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import MainBar from './MainBar';

const AppPage = () => {
    const { t } = useTranslation();

    const [selectedFiles, setSelectedFiles] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    //
    //upload file
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
            const response = await fetch('URL_API', {
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
    };

    //
    //drag & drop
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
        console.log('File inviati con successo!');
        console.log(droppedFiles[0].name);
        setSelectedFiles(droppedFiles);
    };

    return (
        <div className="container-fluid" >

            <MainBar />
            {/* Main Content */}
            <div className='d-flex flex-column justify-content-center m-auto' >
                <div className="row ">
                    <div className="col-12 m-auto text-center">
                        <h1 className='m-2' >{t('welcome')}</h1>
                        <h4 className='m-2 blockquote' >{t('subtitle')}</h4>

                        <input
                            type='file'
                            // className="btn btn-link inp-hover"
                            className={`btn btn-link inp-hover m-1 ${isDragging ? 'dragging' : ''}`}
                            onChange={(e) => setSelectedFiles(e.target.files)}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            multiple
                        />
                        <button className='btn btn-link' onClick={uploadFiles}>
                            Invia
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );

};

export default AppPage;
