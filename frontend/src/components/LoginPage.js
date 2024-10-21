// components/LoginPage.js
import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';  // Aggiungi Axios per le richieste HTTP
import '../style/HomePage.css'; // Assicurati che questo stile venga applicato
import MainBar from './MainBar';

const LoginPage = () => {
    // Usa la variabile d'ambiente
    const apiUrl = process.env.REACT_APP_API_URL;

    const { t } = useTranslation();
    const { dispatch } = useAuthContext();
    const [loading, setLoading] = useState(false);  // Nuovo stato per disabilitare il bottone
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');  // Per visualizzare eventuali errori
    const navigate = useNavigate(); // Usa useNavigate per la navigazione

    const handleLogin = async (e) => {
        e.preventDefault(); // Previene il comportamento di submit predefinito del form
        setError('');  // Resetta il messaggio di errore

        if (username && password) {
            setLoading(true);  // Disabilita il bottone di login

            try {
                // Invia la richiesta POST al server con le credenziali
                const response = await axios.post(`${apiUrl}/login`, {
                    username: username.toLowerCase(),
                    password
                });

                // Estrarre il token dalla risposta del server
                const { token } = response.data;

                // Salva il token nel localStorage
                localStorage.setItem('token', token);

                // Puoi anche salvare informazioni sull'utente
                const expiresAt = new Date().getTime() + 60 * 60 * 1000; // 1 ora di validità del token
                const user = { username };

                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('expiresAt', expiresAt.toString());

                // Aggiorna lo stato globale (AuthContext)
                dispatch({ type: 'LOGIN', payload: { user, expiresAt } });

                // Reindirizza alla pagina /app
                navigate('/app');
            } catch (error) {
                console.error('Errore di login:', error);
                //setError('Credenziali non valide, riprova.');  // Imposta il messaggio di errore

                // Controlla se è stato attivato il rate limiter o altri errori
                if (error.response && error.response.status === 429) {
                    setError('Troppi tentativi di login. Riprova più tardi.');
                } else if (error.response && error.response.status === 400) {
                    setError('Credenziali non valide. Riprova.');
                } else {
                    setError('Errore di rete o del server.');
                }


            } finally {
                // Imposta un timeout di 5 secondi per riabilitare il bottone di login
                setTimeout(() => {
                    setLoading(false);
                }, 3000); // Timeout di 3 secondi
            }
        } else {
            setError('Username e password sono obbligatori');
        }
    };

    return (
        <div className="container-fluid">
            <MainBar />
            <div className="d-flex justify-content-center align-items-center m-auto">
                <div className="card login_form">
                    <div className="card-body">
                        <h5 className="card-title text-center text-white mb-3">{t('login_title')}</h5>

                        <form onSubmit={handleLogin}>
                            <div className="my-3 center_form">
                                <label htmlFor="username" className="form-label text-grey">{t('username')}</label>
                                <input
                                    type="text"
                                    id="username"
                                    placeholder={t('username_insert')}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="form-control form-control_login bg_form_login"
                                />
                            </div>
                            <div className="mb-3 center_form">
                                <label htmlFor="password" className="form-label text-grey">{t('password')}</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder={t('password_insert')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-control form-control_login bg_form_login"
                                />
                            </div>
                            {error && <div className="alert alert-danger">{error}</div>} {/* Mostra gli errori */}
                            <button type="submit" className="btn btn-primary w-100"
                                disabled={loading}  // Disabilita il bottone durante il caricamento
                            >
                                {loading ? t('login_loading_btn') : t('login_send_btn')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
