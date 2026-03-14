// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { LanguageProvider } from "./src/context/LanguageContext";

import "./src/i18n/i18n";


export default function App() {
  return (
    <LanguageProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
    </LanguageProvider>
  );
}