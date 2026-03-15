import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import auth from "@react-native-firebase/auth";

export default function LogoutScreen({ navigation }) {

  const { t } = useTranslation();

  useEffect(() => {

    const logout = async () => {
      try {
        await auth().signOut();
        navigation.replace("LoginScreen");
      } catch (error) {
        console.log(error);
      }
    };

    logout();

  }, []);

  return (
    <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
      <ActivityIndicator size="large" />
    </View>
  );
}