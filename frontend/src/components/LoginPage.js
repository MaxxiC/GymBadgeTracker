// components/LoginPage.js
import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import MainBar from './MainBar';

const LoginPage = () => {
    const { t } = useTranslation();
    const { dispatch } = useAuthContext();
    const [username, setUsername] = useState('');
    const navigate = useNavigate(); // Usa useNavigate per la navigazione

    const handleLogin = () => {
        // Aggiungi la logica di autenticazione qui
        // Verifica le credenziali, ecc.
        if (username) {
            dispatch({ type: 'LOGIN', payload: { username } });
            // Reindirizza l'utente dopo il login
            navigate('/app');
        }
    };

    return (
        <div className="container-fluid">
            <MainBar />
            <div>
                <h2>Login Page</h2>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button onClick={handleLogin}>Login</button>
            </div></div>
    );
};

export default LoginPage;
