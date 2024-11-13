// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import HomePage from './components/HomePage';
import AppPage from './components/AppPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import RegistrationRoute from './components/RegistrationRoute';
import { AuthContextProvider } from './context/AuthContext';
import './style/index.css';

// Forza HTTPS se la connessione è HTTP
if (window.location.protocol === 'http:') {
  window.location.href = window.location.href.replace('http:', 'https:');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <AuthContextProvider>
        <I18nextProvider i18n={i18n}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Usa ProtectedRoute qui */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppPage />
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              <RegistrationRoute>
                <RegisterPage />
              </RegistrationRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </I18nextProvider>
      </AuthContextProvider>
    </Router>
  </React.StrictMode>
);
