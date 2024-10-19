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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');  // Per visualizzare eventuali errori
    const navigate = useNavigate(); // Usa useNavigate per la navigazione

    const handleLogin = async (e) => {
        e.preventDefault(); // Previene il comportamento di submit predefinito del form
        setError('');  // Resetta il messaggio di errore

        if (username && password) {
            try {
                // Invia la richiesta POST al server con le credenziali
                const response = await axios.post(`${apiUrl}/login`, {
                    username: username,
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
                setError('Credenziali non valide, riprova.');  // Imposta il messaggio di errore
            }
        } else {
            setError('Username e password sono obbligatori');
        }
    };

    return (
        <div className="container-fluid">
            <MainBar />
            <div className="d-flex justify-content-center align-items-center vh-100">
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
                            <button type="submit" className="btn btn-primary w-100">
                                {t('login_send_btn')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
