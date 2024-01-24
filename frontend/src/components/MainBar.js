// components/mainBar.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';

const MainBar = () => {

    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng).then(() => {
            console.log(`Lingua cambiata con successo a ${lng}`);
        });
    };

    return (

        <div className="row text-white p-2">
            <div className="col-2 align-self-center">
                <div className="logo-container"></div>
            </div>
            <div className="col-8 d-flex align-items-center justify-content-end">

            </div>
            <div className="col-2 d-flex align-items-center justify-content-end">
                <button className="btn btn-link m-1 text-decoration-none">{t('btn_info')}</button>
                <button className="btn btn-link m-1 text-decoration-none">{t('btn_about')}</button>
                <select
                    className="form-control form-control-sm m-1"
                    onChange={(e) => changeLanguage(e.target.value)}
                    value={i18n.language}
                >
                    <option value="it">ITA</option>
                    <option value="en">ENG</option>
                </select>
            </div>
        </div>


    );
};

export default MainBar;