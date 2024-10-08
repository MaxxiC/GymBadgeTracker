// components/LoginPage.js
import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css'; // Assicurati che questo stile venga applicato
import MainBar from './MainBar';

const LoginPage = () => {
    const { t } = useTranslation();
    const { dispatch } = useAuthContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Usa useNavigate per la navigazione

    const handleLogin = () => {
        if (username && password) {
            // Puoi aggiungere qui la logica per verificare le credenziali
            dispatch({ type: 'LOGIN', payload: { username } });
            navigate('/app');
        }
    };

    return (
        <div className="container-fluid">
            <MainBar />
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="card login_form">
                    <div className="card-body">
                        <h5 className="card-title text-center text-white">{t('login_title')}</h5>
                        <div className="mb-3 center_form">
                            <label htmlFor="username" className="form-label text-grey">{t('username')}</label>
                            <input
                                type="text"
                                id="username"
                                placeholder={t('username_insert')}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-control bg_form_login"
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
                                className="form-control bg_form_login"
                            />
                        </div>
                        <button onClick={handleLogin} className="btn btn-primary w-100">
                            {t('login_send_btn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
