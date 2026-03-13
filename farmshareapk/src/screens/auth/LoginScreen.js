import React,{useState} from "react";
import {View,TextInput,Button,StyleSheet} from "react-native";
import { loginUser } from "../../firebase/userService";

export default function LoginScreen({navigation}){

  const [phone,setPhone]=useState("");
  const [password,setPassword]=useState("");

  const handleLogin = async () => {

    try{

      const user = await loginUser(phone,password);

      if(user.role === "provider"){
        navigation.replace("ProviderDashboard");
      }else{
        navigation.replace("FarmerDashboard");
      }

    }catch(err){
      alert(err.message);
    }

  };

  return(

    <View style={styles.container}>

      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        onChangeText={setPhone}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin}/>

      <Button title="Register" onPress={() => navigation.navigate("RoleSelection")}
/>

    </View>

  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:"center",padding:20},
  input:{borderWidth:1,padding:10,marginBottom:10}
});