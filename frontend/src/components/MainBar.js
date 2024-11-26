import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import { useAuthContext } from '../context/AuthContext';

const MainBar = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { logout, isAuthenticated } = useAuthContext(); // Ottieni la funzione di logout dal contesto

    // Stato per controllare la visibilità della modal
    //const [showModal, setShowModal] = useState(false);

    // Funzione per aprire/chiudere la modal
    //const toggleModal = () => setShowModal(!showModal);

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
        <>
            {/* Barra principale */}
            <div className="row text-white p-2">
                <div className="col-2 align-self-center">
                    <button className="logo-container border-0" onClick={() => navigate(`/`)}></button>
                </div>
                <div className="col-8 d-flex align-items-center justify-content-end"></div>
                <div className="col-2 d-flex align-items-center justify-content-end">
                    <button className="btn btn-link btn-link-h btn-gym-color m-1 " onClick={() => navigate(`/info`)}>
                        {t('btn_info')}
                    </button>
                    <button className="btn btn-link btn-link-h btn-gym-color m-1 " onClick={() => navigate(`/Contattaci`)}>
                        {t('Contattaci')}
                    </button>
                    <select
                        className="form-control form-control-sm m-1"
                        onChange={(e) => changeLanguage(e.target.value)}
                        value={i18n.language}
                    >
                        <option value="it">ITA</option>
                        <option value="en">ENG</option>
                    </select>

                    {/* Bottone utente */}
                    <button
                        className="btn btn-link btn-link-h m-1 text-decoration-none"
                        id="btnUser"
                        data-bs-toggle="modal"
                        data-bs-target="#userModal"
                    >
                        <i className="bi bi-person-circle"></i>
                    </button>

                </div>
            </div>

            {/* Modal */}

            <div className="modal fade" tabIndex="-1" id="userModal"
                aria-labelledby="userModalLabel"
                aria-hidden="true" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">

                    <div className="modal-content">

                        <div className="modal-header modal-filters-header">
                            <h5 className="modal-title">{isAuthenticated && t('modal_user_title')}</h5>
                            <button
                                type="button"
                                className="close btn-close  bg-white"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body modal-filters-body text-center">
                            {isAuthenticated && <>
                                <p>Dettagli dell'utente...</p>
                            </>}
                            {!isAuthenticated && <>
                                <Link to="/login" className="btn btn-primary btn-link">
                                    {t('modal_goToLogin')}
                                </Link>
                            </>}
                        </div>

                        <div className="modal-footer modal-filters-footer">
                            {isAuthenticated && <>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    Close
                                </button>
                            </>}
                        </div>
                    </div>

                </div>
            </div>

        </>
    );
};

export default MainBar;
