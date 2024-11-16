// components/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css'; // Assicurati che questo stile venga applicato
import MainBar from './MainBar';

const RegisterPage = () => {
    const apiUrl = process.env.REACT_APP_API_URL;

    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
    
        if (username && email && password) {
            setLoading(true);
    
            try {
                // Recupera il token dal localStorage (o da dove lo conservi)
                const token = localStorage.getItem('token');
    
                // Invia la richiesta POST al server per la registrazione
                const response = await axios.post(`${apiUrl}/register`, {
                    username: username.toLowerCase(),
                    email: email.toLowerCase(),
                    password,
                    isAdmin: localStorage.getItem("adminRole"),
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`  // Includi il token nell'intestazione
                    }
                });
    
                setSuccess('Registrazione completata con successo!');
                setTimeout(() => {
                    navigate('/login'); // Reindirizza alla pagina di login dopo la registrazione
                }, 3000);
            } catch (error) {
                console.error('Errore di registrazione:', error);
                if (error.response && error.response.status === 400) {
                    setError('L\'email è già registrata o i dati non sono validi.');
                } else if (error.response && error.response.status === 403) {
                    setError('Accesso negato: solo un admin può eseguire questa operazione.');
                } else {
                    setError('Errore di rete o del server.');
                }
            } finally {
                setLoading(false);
            }
        } else {
            setError('Tutti i campi sono obbligatori.');
        }
    };
    

    return (
        <div className="container-fluid index-container">
            <MainBar />
            <div className="d-flex justify-content-center align-items-center m-auto">
                <div className="card register_form">
                    <div className="card-body">
                        <h5 className="card-title text-center text-white mb-3">{t('register_title')}</h5>

                        <form onSubmit={handleRegister}>
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
                                <label htmlFor="email" className="form-label text-grey">{t('email')}</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder={t('email_insert')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    autoComplete="new-password"
                                />
                            </div>
                            {error && <div className="alert alert-danger">{error}</div>} {/* Mostra errori */}
                            {success && <div className="alert alert-success">{success}</div>} {/* Mostra messaggio di successo */}
                            <button type="submit" className="btn btn-primary w-100"
                                disabled={loading}
                            >
                                {loading ? t('register_loading_btn') : t('register_send_btn')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
