// components/LoginPage.js
import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Per la navigazione

const LoginPage = () => {
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
    <div>
      <h2>Login Page</h2>
      <input 
        type="text" 
        placeholder="Enter username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;
