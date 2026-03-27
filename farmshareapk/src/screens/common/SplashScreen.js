import React, { useEffect } from "react";
import { ImageBackground, Image, StyleSheet } from "react-native";

export default function SplashScreen({ navigation }) {

  useEffect(() => {
    // Navigate to LanguageSelector after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace("LanguageSelector");
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      source={require("../../../assets/images/background5.png")}
      style={styles.container}
      resizeMode="cover"  // Ensures background fills the screen
    >
      <Image
        source={require("../../../assets/logo/Logo.png")}
        style={styles.logo}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain"
  }
});