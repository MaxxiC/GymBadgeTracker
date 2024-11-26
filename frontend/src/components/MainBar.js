// components/mainBar.js
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import { useAuthContext } from '../context/AuthContext';

const MainBar = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { logout, isAuthenticated } = useAuthContext(); // Ottieni la funzione di logout dal contesto

    const handleLogout = () => {
        logout(); // Esegui il logout
        navigate('/'); // Reindirizza alla pagina di login dopo il logout
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng).then(() => {
            console.log(`Lingua cambiata con successo a ${lng}`);
        });
    };

    return (

        <div className="row text-white p-2">
            <div className="col-2 align-self-center">
                <button className="logo-container border-0" onClick={() => navigate(`/`)}></button>
            </div>
            <div className="col-8 d-flex align-items-center justify-content-end">

            </div>
            <div className="col-2 d-flex align-items-center justify-content-end">
                <button className="btn btn-link btn-link-h btn-gym-color m-1 " onClick={() => navigate(`/info`)}>{t('btn_info')}</button>
                <button className="btn btn-link btn-link-h btn-gym-color m-1 " onClick={() => navigate(`/Contattaci`)}>{t('Contattaci')}</button>
                <select
                    className="form-control form-control-sm m-1"
                    onChange={(e) => changeLanguage(e.target.value)}
                    value={i18n.language}
                >
                    <option value="it">ITA</option>
                    <option value="en">ENG</option>
                </select>
                
                {isAuthenticated && <button className="btn btn-link btn-link-h m-1 text-decoration-none" onClick={handleLogout}><i class="bi bi-person-circle"></i></button>}
            </div>
        </div>


    );
};

export default MainBar;