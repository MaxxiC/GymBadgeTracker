// components/HomePage.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import MainBar from './MainBar';
import { useAuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="container-fluid">
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
              <Link to="/app" className="btn btn-primary">
                {t('goToApp')}
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary">
                {t('goToLogin')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
