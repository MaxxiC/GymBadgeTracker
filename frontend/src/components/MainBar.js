import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css';
import { useAuthContext } from '../context/AuthContext';
import axios from 'axios';

const MainBar = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const { t, i18n } = useTranslation();
    const { logout, isAuthenticated } = useAuthContext(); // Ottieni la funzione di logout dal contesto

    const [dashboardData, setDashboardData] = useState(null);

    const fetchDashboardData = async () => {
        try {
            // Recupera il token dal localStorage (o da dove lo conservi)
            const token = localStorage.getItem('token');

            const response = await axios.get(`${apiUrl}/api/user-dashboard`,{
                headers: {
                    Authorization: `Bearer ${token}`  // Includi il token nell'intestazione
                }
            }); // Nuova API
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchDashboardData();
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout(); // Esegui il logout
        navigate('/'); // Reindirizza alla pagina di login dopo il logout
    };

    const handleLogin = () => {
        navigate('/login'); // Reindirizza alla pagina di login dopo il logout
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

            <div className="modal fade"
                tabIndex="-1"
                id="userModal"
                aria-labelledby="userModalLabel"
                aria-hidden="true" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header modal-filters-header">
                            <h5 className="modal-title">{isAuthenticated && t('modal_user_dashboard_title')}</h5>
                            <button
                                type="button"
                                className="close btn-close  bg-white"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body modal-filters-body text-center">
                            {isAuthenticated ? <>
                                {dashboardData ? (
                                    <div className="dashboard">
                                        <h5 className="mb-3">{dashboardData.username}</h5>
                                        <div className="mb-4">
                                            <span className="badge bg-primary gym-color">
                                                {t('modal_user_usage_remaining')}: {dashboardData.n_usage_total}
                                            </span>
                                        </div>

                                        <div className="list-group mb-4">
                                            <div className="list-group-item">
                                                <strong>{t('modal_user_email')}:</strong> {dashboardData.email}
                                            </div>
                                            <div className="list-group-item">
                                                <strong>{t('modal_user_total_downloads')}:</strong> {dashboardData.total_downloads}
                                            </div>
                                            <div className="list-group-item">
                                                <strong>{t('modal_user_total_documents')}:</strong> {dashboardData.total_documents}
                                            </div>
                                        </div>

                                        <small className="">
                                            {t('modal_user_account_created')} {new Date(dashboardData.first_login).toLocaleDateString()}
                                        </small>
                                    </div>
                                ) : (
                                    <p>{t('modal_user_loading_dashboard')}</p>
                                )}
                            </> : <>

                                <button
                                    type="button"
                                    className="btn btn-primary btn-link"
                                    onClick={handleLogin}
                                    data-bs-dismiss="modal"
                                >
                                    {t('modal_goToLogin')}
                                </button>

                            </>}
                        </div>

                        <div className="modal-footer modal-filters-footer">
                            {isAuthenticated && <>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-link btn-gym-color"
                                    onClick={handleLogout}
                                    data-bs-dismiss="modal"
                                >
                                    {t('btn_logout')}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    {t('btn_close')}
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
