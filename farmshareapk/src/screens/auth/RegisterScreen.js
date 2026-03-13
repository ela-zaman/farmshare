import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { registerUser } from "../../firebase/authService";

export default function RegisterScreen({ navigation, route }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  // Get role from navigation params; default to "farmer"
  const role = route.params?.role || "farmer";

  const handleRegister = async () => {
    if (!name || !phone || !password || !address) {
      alert("Please fill all fields!");
      return;
    }

    try {
      // Register user in Firebase
      await registerUser({ name, phone, address, password, role });

      alert("Registration successful!");

      // Redirect to role-specific dashboard
      if (role === "farmer") {
        navigation.reset({
          index: 0,
          routes: [{ name: "FarmerDashboard" }],
        });
      } else if (role === "provider") {
        navigation.reset({
          index: 0,
          routes: [{ name: "ProviderDashboard" }],
        });
      }
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register as: {role}</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});