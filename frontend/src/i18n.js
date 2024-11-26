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
          goToApp: 'Vai all\'app',
          goToLogin: 'LOGIN',
          appPageTitle: 'Titolo della Pagina App',
          someText: 'Qualche testo per la Pagina App',
          uploadFile: 'Carica File',
          btn_info: 'INFO',
          btn_about: 'ABOUT',
          btn_logout: 'LOGOUT',
          footer_text: 'Tutti i diritti riservati.',

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

          appPage_welcome: 'Benvenuto',
          appPage_subtitle: 'Prova il servizio',
          appPage_chooseFile: 'Scegli il File',
          appPage_btn_load_sheet: 'Carica i fogli',
          appPage_btn_filter_change: 'Cambia Filtri',
          appPage_btn_filter_choose: 'Scegli Filtri',
          appPage_btn_send: 'Elabora tutto',

          modal_filters_title: 'Attività trovate nel file che verranno processate',
          modal_filters_subtitle: 'Deselezionare i valori **da non controllare**',
          modal_filters_btn_close: 'Annulla',
          modal_filters_btn_confirm: 'Conferma',

          modal_goToLogin: 'Effettua il login per vedere i tuoi dati.',
        },
      },
      en: {
        translation: {
          welcome: 'Welcome',
          goToApp: 'Go to App',
          goToLogin: 'LOGIN',
          appPageTitle: 'App Page Title',
          someText: 'Some text for App Page',
          uploadFile: 'Upload File',
          btn_info: 'INFO',
          btn_about: 'ABOUT',
          btn_logout: 'LOGOUT',
          footer_text: 'All rights reserved.',

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

          appPage_welcome: 'Welcome',
          appPage_subtitle: 'Try our service',
          appPage_chooseFile: 'Choose your File',
          appPage_btn_load_sheet: 'Load Sheets',
          appPage_btn_filter_change: 'Change Filters',
          appPage_btn_filter_choose: 'Choose Filters',
          appPage_btn_send: 'Process everything',

          modal_filters_title: 'Activities found in the file that will be processed',
          modal_filters_subtitle: 'Uncheck the value to **don\'t check**',
          modal_filters_btn_close: 'Cancel',
          modal_filters_btn_confirm: 'Confirm',

          modal_goToLogin: 'Log in to view your data.',
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
