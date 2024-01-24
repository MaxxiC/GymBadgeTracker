// components/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng).then(() => {
      // Opzionale: Puoi eseguire azioni aggiuntive dopo il cambio di lingua
      console.log(`Lingua cambiata con successo a ${lng}`);
    });
  };

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('selectLanguage')}</p>

      {/* Menù a tendina per la lingua */}
      <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
        <option value="it">ITA</option>
        <option value="en">ENG</option>
      </select>

      <Link to="/app">
        <button>{t('goToApp')}</button>
      </Link>
    </div>
  );
};

export default HomePage;
