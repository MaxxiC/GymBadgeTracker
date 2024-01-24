// components/HomePage.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import MainBar from './MainBar';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="container-fluid">
      <MainBar />
      {/* Main Content */}
        <div className='d-flex flex-column justify-content-center m-auto'>
        <div className="row ">
          <div className="col-6">
          <div className="exe-container"></div>
          </div>
          <div className="col-6 m-auto">
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
};

export default HomePage;
