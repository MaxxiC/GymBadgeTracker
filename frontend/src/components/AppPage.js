// components/AppPage.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import MainBar from './MainBar';

const AppPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container-fluid">
      <MainBar />
      {/* Main Content */}
        <div className='d-flex flex-column justify-content-center m-auto'>
        <div className="row ">
          <div className="col-12 m-auto">
            <h2>{t('welcome')}</h2>
            <p>{t('subtitle')}</p>
            <Link to="/app" className="btn btn-primary">
              {t('goToApp')}
            </Link>
          </div>
        </div>
        </div>
      </div>
  );

  return (
    <div>
      <h1>Benvenuto all'App Page</h1>
      <p>Alcuni testi qui...</p>
      {/* Aggiungi il bottone "Carica File" */}
    </div>
  );
};

export default AppPage;
