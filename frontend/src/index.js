// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import HomePage from './components/HomePage';
import AppPage from './components/AppPage';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthContextProvider } from './context/AuthContext';
import './style/index.css';

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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </I18nextProvider>
      </AuthContextProvider>
    </Router>
  </React.StrictMode>
);
