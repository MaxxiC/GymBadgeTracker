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

    const fetchLogs = async () => {
        try {
            const logsResponse = await axios.get(`${apiUrl}/admin/recent-logs`);
            setLogs(logsResponse.data.recentLogs);
        } catch (error) {
            console.error("Errore nel recupero dei log", error);
        }
    };
    
    useEffect(() => {
        // Caricamento iniziale
        fetchUserData();
        fetchFileData();
        fetchLogs();
        setLoading(false);

        // Intervalli per aggiornamenti periodici
        const userFileInterval = setInterval(() => {
            fetchUserData();
            fetchFileData();
        }, 30000); // Ogni 30 secondi

        const logInterval = setInterval(() => {
            fetchLogs();
        }, 5000); // Ogni 5 secondi

        // Pulizia degli intervalli al termine del componente
        return () => {
            clearInterval(userFileInterval);
            clearInterval(logInterval);
        };
    }, [apiUrl]);

    return (
        <div className="container-fluid">
            <MainBar />
            <div className="d-flex flex-column align-items-center">
                <div className="section d-flex justify-content-center align-items-center m-4">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="d-flex flex-column align-items-center">
                            <div className="d-flex">
                                <div className="square m-2 p-3">
                                    <h4>{t('Totale Utenti')}</h4>
                                    <p>{userData.totalUsers}</p>
                                </div>
                                <div className="square m-2 p-3">
                                    <h4>{t('Utenti Login Ultima Ora')}</h4>
                                    <p>{userData.lastHourLogins}</p>
                                </div>
                                <div className="square m-2 p-3">
                                    <h4>{t('Utenti Login Ultime 12 Ore')}</h4>
                                    <p>{userData.last12HoursLogins}</p>
                                </div>
                            </div>
                            <div className="d-flex">
                                <div className="square m-2 p-3">
                                    <h4>{t('Totale File')}</h4>
                                    <p>{fileData.totalFiles}</p>
                                </div>
                                <div className="square m-2 p-3">
                                    <h4>{t('File Cancellati')}</h4>
                                    <p>{fileData.deletedFiles}</p>
                                </div>
                                <div className="square m-2 p-3">
                                    <h4>{t('Righe Totali Processate')}</h4>
                                    <p>{fileData.totalRows}</p>
                                </div>
                                <div className="square m-2 p-3">
                                    <h4>{t('ID Unici Processati')}</h4>
                                    <p>{fileData.uniquePeople}</p>
                                </div>
                            </div>
                            <div className="log-section m-2 p-3">
                                <h4>{t('Ultimi Log')}</h4>
                                <ul>
                                    {logs.map((log, index) => (
                                        <li key={index}>
                                            <strong>{log.log_type}:</strong> {log.log_message} - <em>{new Date(log.created_at).toLocaleString()}</em>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                <div className="second-section m-4 p-5" style={{ backgroundColor: 'black', height: '300px' }}>
                    {/* Sezione vuota per aggiunte future */}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
