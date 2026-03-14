import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  ImageBackground,
  Image
} from "react-native";

export default function SplashScreen({ navigation }) {

  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      }),

      Animated.timing(opacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      })
    ]).start();

    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "IntroSlider" }],
      });
    }, 8500);

  }, []);

  return (

    <ImageBackground
      source={require("G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >

      <Animated.Image
        source={require("G:/Farm-Share Ap/farmshare/farmshareapk/assets/logo/Logo.png")}
        style={[
          styles.logo,
          {
            transform: [{ scale }],
            opacity
          }
        ]}
      />

    </ImageBackground>

  );
}

const styles = StyleSheet.create({

  background:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },

  logo:{
    width:180,
    height:180
  }

});