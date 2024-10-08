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

    const handleLogin = (e) => {
        e.preventDefault(); // Previene il comportamento di submit predefinito del form
        if (username && password) {
            const expiresAt = new Date().getTime() + 5 * 60 * 1000; // 5 minuti
            const user = { username };

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('expiresAt', expiresAt.toString());

            dispatch({ type: 'LOGIN', payload: { user, expiresAt } });
            navigate('/app');
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
