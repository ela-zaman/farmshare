import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";

export default function SplashScreen({ navigation }) {

  useEffect(() => {

    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      }); // go to intro screen
    }, 3000); // show splash for 3 seconds

    return () => clearTimeout(timer);

  }, []);

  return (
    <View style={styles.container}>

      <Image
        source={require("G:/Farm-Share Ap/farmshare/farmshareapk/assets/logo/Logo1.png")}
        style={styles.logo}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center"
  },

  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain"
  }

});