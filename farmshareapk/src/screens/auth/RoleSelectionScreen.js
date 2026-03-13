import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function RoleSelectionScreen({ navigation }) {
  const selectRole = (role) => {
    // Navigate to RegisterScreen with the selected role
    navigation.navigate("Register", { role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>

      <TouchableOpacity
        style={[styles.button, styles.farmerButton]}
        onPress={() => selectRole("farmer")}
      >
        <Text style={styles.buttonText}>Farmer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.providerButton]}
        onPress={() => selectRole("provider")}
      >
        <Text style={styles.buttonText}>Provider</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  farmerButton: {
    backgroundColor: "#4CAF50",
  },
  providerButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});