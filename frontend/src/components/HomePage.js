// components/HomePage.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import MainBar from './MainBar';
import { useAuthContext } from '../context/AuthContext';
import logoFitCesena from '../images/Logo-fit-Cesena.jpg';

const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="container-fluid index-container">
      <MainBar />
      {/* Main Content */}
      <div className='d-flex flex-column justify-content-center m-auto'>
        <div className="row ">
          <div className="col-6 d-flex">
            <div className="exe-container"></div>
          </div>
          <div className="col-6 m-auto">
            <h2>{t('welcome')}</h2>
            <p>{t('subtitle')}</p>
            {isAuthenticated ? (
              <Link to="/app" className="btn btn-primary btn-link">
                {t('goToApp')}
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-link">
                {t('goToLogin')}
              </Link>
            )}
          </div>
        </div>
      </div>
    {/* Footer */}
    <footer className="mt-auto py-3">
      <div className="container d-flex justify-content-between align-items-center">
        <p className="m-0 text-center w-100">© {new Date().getFullYear()} GymBadgeTracker. {t('footer_text')}</p>
        <img
          src={logoFitCesena}
          alt="Logo FitActive Cesena"
          className="img-fluid"
          style={{ maxWidth: '80px', height: 'auto' }}
        />
      </div>
    </footer>
  </div>
);
};

export default HomePage;
