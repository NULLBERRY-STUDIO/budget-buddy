
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all language files
import en from './en.json';
import de from './de.json';
import tr from './tr.json';
import ar from './ar.json';
import es from './es.json';
import ru from './ru.json';
import fr from './fr.json';
import pl from './pl.json';
import ur from './ur.json';

// Define supported languages with their display names
export const languages = {
  en: { name: 'English', dir: 'ltr', nativeName: 'English' },
  de: { name: 'German', dir: 'ltr', nativeName: 'Deutsch' },
  tr: { name: 'Turkish', dir: 'ltr', nativeName: 'Türkçe' },
  ar: { name: 'Arabic', dir: 'rtl', nativeName: 'العربية' },
  es: { name: 'Spanish', dir: 'ltr', nativeName: 'Español' },
  ru: { name: 'Russian', dir: 'ltr', nativeName: 'Русский' },
  fr: { name: 'French', dir: 'ltr', nativeName: 'Français' },
  pl: { name: 'Polish', dir: 'ltr', nativeName: 'Polski' },
  ur: { name: 'Urdu', dir: 'rtl', nativeName: 'اردو' }
};

// Configure i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      tr: { translation: tr },
      ar: { translation: ar },
      es: { translation: es },
      ru: { translation: ru },
      fr: { translation: fr },
      pl: { translation: pl },
      ur: { translation: ur }
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    }
  });

export default i18n;
