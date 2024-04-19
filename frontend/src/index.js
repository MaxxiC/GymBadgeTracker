// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Importa il tuo file di configurazione i18n
import HomePage from './components/HomePage';
import AppPage from './components/AppPage';
import './style/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/app" element={<AppPage />} />
          {/* Aggiungi qui una route per qualsiasi altra pagina */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </I18nextProvider>
    </Router>
  </React.StrictMode>
);
