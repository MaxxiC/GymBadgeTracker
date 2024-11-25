// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: {
        translation: {
          welcome: 'Benvenuto',
          subtitle: 'Prova il servizio',
          goToApp: 'Vai all\'app',
          goToLogin: 'LOGIN',
          appPageTitle: 'Titolo della Pagina App',
          someText: 'Qualche testo per la Pagina App',
          uploadFile: 'Carica File',
          btn_info: 'INFO',
          btn_about: 'ABOUT',
          btn_logout: 'LOGOUT',

          login_title: 'Esegui l\'accesso per usufruire del servizio',
          username: 'Utente',
          username_insert: 'Inserisci il tuo username',
          password: 'Password',
          password_insert: 'Inserisci la password',
          login_send_btn: 'Accedi',
          login_loading_btn: 'Attendi',

          oldfiles_title: 'File caricati precedentemente',
          oldfiles_tbl_col_name: 'Nome File',
          oldfiles_tbl_col_sheet: 'Nome Foglio',
          oldfiles_tbl_col_data: 'Data',
          oldfiles_tbl_col_download: 'Scarica',
          oldfiles_tbl_col_delete: 'Elimina',
        },
      },
      en: {
        translation: {
          welcome: 'Welcome',
          subtitle: 'Try our service',
          goToApp: 'Go to App',
          goToLogin: 'LOGIN',
          appPageTitle: 'App Page Title',
          someText: 'Some text for App Page',
          uploadFile: 'Upload File',
          btn_info: 'INFO',
          btn_about: 'ABOUT',
          btn_logout: 'LOGOUT',

          login_title: 'Login Page',
          username: 'Username',
          username_insert: 'Insert your username',
          password: 'Password',
          password_insert: 'Insert your password',
          login_send_btn: 'Login',
          login_loading_btn: 'Wait',

          oldfiles_title: 'Previously uploaded files',
          oldfiles_tbl_col_name: 'File Name',
          oldfiles_tbl_col_sheet: 'Sheet Name',
          oldfiles_tbl_col_data: 'Date',
          oldfiles_tbl_col_download: 'Download',
          oldfiles_tbl_col_delete: 'Delete',
        },
      },
    },
    lng: 'it', // Imposta la lingua di default su italiano
    fallbackLng: 'it', // Se la chiave di traduzione non è presente nella lingua preferita, cerca in italiano
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
