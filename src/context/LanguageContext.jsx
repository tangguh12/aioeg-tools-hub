import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Load saved language from localStorage or default to 'en'
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('aioeg_locale') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('aioeg_locale', locale);
  }, [locale]);

  const t = (key, params = {}) => {
    let text = translations[locale][key] || key;
    
    // Simple param replacement, e.g., {time}
    Object.keys(params).forEach(p => {
      text = text.replace(`{${p}}`, params[p]);
    });
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
