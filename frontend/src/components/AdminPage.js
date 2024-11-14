// components/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/HomePage.css'; // Assicurati che questo stile venga applicato
import MainBar from './MainBar';

const AdminPage = () => {
    const apiUrl = process.env.REACT_APP_API_URL;

    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="container-fluid">
            <MainBar />
            <div className="d-flex justify-content-center align-items-center m-auto">
            </div>
        </div>
    );
};

export default AdminPage;
