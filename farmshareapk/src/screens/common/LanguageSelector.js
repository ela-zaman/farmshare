import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { LanguageContext } from "../../context/LanguageContext";
import { useTranslation } from "react-i18next";

export default function LanguageSelector({ navigation }) {

  const { changeLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  const selectLanguage = async (lang) => {
    await changeLanguage(lang);
    navigation.replace("IntroSlider");
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>{t("select_language")}</Text>

      <Button
        title={t("english")}
        onPress={() => selectLanguage("en")}
      />

      <Button
        title={t("bangla")}
        onPress={() => selectLanguage("bn")}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20
  },

  title: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: "center"
  }
});