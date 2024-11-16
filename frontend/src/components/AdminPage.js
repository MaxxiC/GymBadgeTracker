// components/AdminPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import MainBar from './MainBar';

const AdminPage = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [userData, setUserData] = useState({});
    const [fileData, setFileData] = useState({});
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterLogs, setFilterLogs] = useState('all');

    const fetchUserData = async () => {
        try {
            const userResponse = await axios.get(`${apiUrl}/admin/total-users`);
            setUserData(userResponse.data);
        } catch (error) {
            console.error("Errore nel recupero dei dati utenti", error);
        }
    };

    const fetchFileData = async () => {
        try {
            const fileResponse = await axios.get(`${apiUrl}/admin/file-stats`);
            setFileData(fileResponse.data);
        } catch (error) {
            console.error("Errore nel recupero delle statistiche file", error);
        }
    };

    const fetchLogs = async (filterLogs = 'all') => { // Accetta un parametro filter
        try {
            const logsResponse = await axios.get(`${apiUrl}/admin/recent-logs`, {
                params: { filterLogs }, // Invia il filtro come parametro query
            });
            setLogs(logsResponse.data.recentLogs);
        } catch (error) {
            console.error("Errore nel recupero dei log", error);
        }
    };

    useEffect(() => {
        // Caricamento iniziale
        fetchUserData();
        fetchFileData();
        setLoading(false);

        // Intervalli per aggiornamenti periodici
        const userFileInterval = setInterval(() => {
            fetchUserData();
            fetchFileData();
        }, 30000); // Ogni 30 secondi

        // Pulizia degli intervalli al termine del componente
        return () => {
            clearInterval(userFileInterval);
        };
    }, [apiUrl]);


    useEffect(() => {
        fetchLogs(filterLogs); // Richiama la funzione con il filtro selezionato

        const logInterval = setInterval(() => {
            fetchLogs(filterLogs);
        }, 5000); // Ogni 5 secondi

        // Pulizia degli intervalli al termine del componente
        return () => {
            clearInterval(logInterval);
        };
    }, [filterLogs]);


    const classCssBoxStats = "col-6 col-sm-4 col-md-3 col-xl-2   m-1 p-3 dashboard-square";

    return (
        <div className="container-fluid index-container">
            <MainBar />

            {/* Stats degli utenti */}
            <div className='container-fluid p-1'>
                <h4 className='text-center'>Stats degli utenti</h4>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="row justify-content-center">
                        <div className={`${classCssBoxStats}  `}>
                            <h5>{t('Totale Utenti Iscritti')}</h5>
                            <p>{userData.totalUsers}</p>
                        </div>

                        <div className={`${classCssBoxStats}  `}>
                            <h5>{t('Utenti Attivi')}</h5>
                            <h6>{t('(ultime 24h)')}</h6>
                            <p>{userData.lastTotHoursLogins}</p>
                        </div>

                        <div className={`${classCssBoxStats}  `}>
                            <h5>{t('Totale Utilizzi rimanenti')}</h5>
                            <h6>{t('(da tutti gli utenti)')}</h6>
                            <p>{userData.totalUsageLeft}</p>
                        </div>

                        <div className={`${classCssBoxStats} `}>
                            <h5>{t('Totale Login effettuati')}</h5>
                            <h6>{t('(da tutti gli utenti)')}</h6>
                            <p>{userData.totalLogin}</p>
                        </div>

                    </div>

                )}
            </div>

            {/* Stats dei file */}
            <div className='container-fluid p-1'>
                <h4 className='text-center'>Stats dei file</h4>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="row justify-content-center">
                        <div className={`${classCssBoxStats}  `}>
                            <h5>{t('Totale File Caricati')}</h5>
                            <p>{fileData.totalFiles}</p>
                        </div>

                        <div className={`${classCssBoxStats}  `}>
                            <h5>{t('Totale File Eliminati')}</h5>
                            <p>{fileData.deletedFiles}</p>
                        </div>

                        <div className={`${classCssBoxStats}  `}>
                            <h5>{t('Totale righe analizzate')}</h5>
                            <h6>{t('(da tutti i file)')}</h6>
                            <p>{fileData.totalRows}</p>
                        </div>

                        <div className={`${classCssBoxStats}  `}>
                            <h5>{t('Totale IDs trovati')}</h5>
                            <h6>{t('(unici)')}</h6>
                            <p>{fileData.uniquePeople}</p>
                        </div>

                        <div className={`${classCssBoxStats} `}>
                            <h5>{t('Totale Download effettuati')}</h5>
                            <p>{fileData.totalDownloadOut}</p>
                        </div>
                    </div>

                )}
            </div>

            {/* Logs Live */}
            <div className="container-fluid p-2">
                <div className="row justify-content-center">
                    <div className="log-section m-2 p-3 col-10 col-md-8 col-lg-7 bg-dark rounded shadow">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="text-white">{t('Ultimi Log')}</h4>
                            <select
                                className="form-select w-auto bg-light text-dark"
                                onChange={(e) => setFilterLogs(e.target.value)} // Gestore di stato per il filtro
                            >
                                <option value="all">{t('Tutti')}</option>
                                <option value="upload">{t('Upload')}</option>
                                <option value="download">{t('Download')}</option>
                                <option value="delete">{t('Delete')}</option>
                                <option value="login">{t('Login')}</option>
                                <option value="error">{t('Error')}</option>
                                <option value="other">{t('Other')}</option>
                            </select>
                        </div>
                        <table className="table table-dark table-hover table-striped ">
                            <thead>
                                <tr className="text-center">
                                    <th>{t('Username')}</th>
                                    <th>{t('Tipo')}</th>
                                    <th>{t('Messaggio')}</th>
                                    <th>{t('Data')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, index) => (
                                    <tr key={index} className="align-middle text-center">
                                        <td>{log.user_username}</td>
                                        <td>
                                            <span
                                                className={`badge ${log.log_type === 'upload'
                                                        ? 'bg-primary'
                                                        : log.log_type === 'download'
                                                            ? 'bg-info'
                                                            : log.log_type === 'delete'
                                                                ? 'bg-secondary'
                                                                : log.log_type === 'login'
                                                                    ? 'bg-success'
                                                                    : log.log_type === 'error'
                                                                        ? 'bg-danger'
                                                                        : 'bg-warning' // Default per 'other' o altri tipi
                                                    }`}
                                            >
                                                {log.log_type}
                                            </span>

                                        </td>
                                        <td>{log.log_message}</td>
                                        <td>
                                            <em>{new Date(log.created_at).toLocaleString()}</em>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminPage;
