import React, { createContext, useState, useEffect } from "react";
import { getAppLanguage, setAppLanguage } from "../i18n/i18n";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const lang = await getAppLanguage();
    setLanguage(lang);
  };

  const changeLanguage = async (lang) => {
    await setAppLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};