import React, { useEffect, useRef } from "react";
import {
  ImageBackground,
  Animated,
  StyleSheet
} from "react-native";

export default function SplashScreen({ navigation }) {

  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {

    Animated.timing(scale,{
      toValue:1,
      duration:1200,
      useNativeDriver:true
    }).start();

    setTimeout(() => {
    navigation.replace("LanguageSelector");
  }, 5000);
  

  },[])

  return(

    <ImageBackground
      source={require("G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/background.png")}
      style={styles.container}
    >

      <Animated.Image
        source={require("../../../assets/logo/Logo.png")}
        style={[styles.logo,{transform:[{scale}]}]}
      />

    </ImageBackground>

  )

}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:"center",alignItems:"center"},
  logo:{width:200,height:200}
});



















