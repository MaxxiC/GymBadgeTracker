// components/RegistrationRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const RegistrationRoute = ({ children }) => {
    const { user } = useAuthContext();

    // Controlla se l'utente è autenticato e se è "testuser123"
    if (!user || user.username !== 'testuser123') {
        return <Navigate to="/" />;
    }

    return children;  // Permetti l'accesso alla route protetta
};

export default RegistrationRoute;
