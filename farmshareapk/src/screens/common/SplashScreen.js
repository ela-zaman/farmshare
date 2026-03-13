import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SplashScreen({ navigation }) {

  useEffect(() => {

    setTimeout(() => {
      navigation.replace("Login");
    }, 2000);

  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FarmShare</Text>
      <Text>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#2E7D32"
  },
  title:{
    fontSize:32,
    color:"white",
    fontWeight:"bold",
    marginBottom:10
  }
});