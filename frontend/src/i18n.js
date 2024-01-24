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
          appPageTitle: 'Titolo della Pagina App',
          someText: 'Qualche testo per la Pagina App',
          uploadFile: 'Carica File',
        },
      },
      en: {
        translation: {
          welcome: 'Welcome',
          goToApp: 'Go to App',
          appPageTitle: 'App Page Title',
          someText: 'Some text for App Page',
          uploadFile: 'Upload File',
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
