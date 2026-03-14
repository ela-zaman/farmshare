import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function SplashScreen({ navigation }) {

  const slideAnim = useRef(new Animated.Value(-width)).current; // start from left side
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      })
    ]).start();

    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      }); 
    }, 2500);

  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("G:/Farm-Share Ap/farmshare/farmshareapk/assets/logo/Logo1.png")}
        style={[
          styles.logo,
          {
            transform: [{ translateX: slideAnim }],
            opacity: opacityAnim
          }
        ]}
        resizeMode="contain"
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
    height: 200
  }
});