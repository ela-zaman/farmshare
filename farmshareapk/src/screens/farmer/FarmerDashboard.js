import React from "react";
import { View, Text, Button, Alert } from "react-native";
import { logoutUser } from "../../firebase/authService";

export default function FarmerDashboard({ navigation }) {
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Farmer Dashboard</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}