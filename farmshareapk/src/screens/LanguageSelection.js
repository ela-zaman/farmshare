import React, { useContext } from "react";
import { View, Text, Button } from "react-native";
import { LanguageContext } from "../../context/LanguageContext";
import i18n from "../../i18n";

export default function LanguageSelector({ navigation }) {

  const { changeLanguage } = useContext(LanguageContext);

  return(

    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>

      <Text>{i18n.t("selectLanguage")}</Text>

      <Button
        title="English"
        onPress={()=>{
          changeLanguage("en")
          navigation.replace("Intro")
        }}
      />

      <Button
        title="বাংলা"
        onPress={()=>{
          changeLanguage("bn")
          navigation.replace("Intro")
        }}
      />

    </View>

  )

}