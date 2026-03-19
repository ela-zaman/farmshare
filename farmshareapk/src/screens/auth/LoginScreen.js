import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { loginUser } from "../../firebase/authService";

export default function LoginScreen({ navigation }) {

  const { t } = useTranslation();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    if (!phone || !password) {
      return Alert.alert(t("error"), t("fill_fields"));
    }

    try {

      const userData = await loginUser({ phone, password });
      const role = userData.role;

      // Role based navigation
      if (role === "farmer") {
        navigation.reset({
          index: 0,
          routes: [{ name: "FarmerDashboard" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "ProviderDashboard" }],
        });
      }

    } catch (error) {
      Alert.alert(t("login_failed"), error.message);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>{t("login")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("phone")}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder={t("password")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title={t("login")} onPress={handleLogin} />

      <View style={{ marginTop: 20 }}>
        <Button
          title={t("register")}
          onPress={() => navigation.navigate("RoleSelection")}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F5F5F5"
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },

  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#000000",
  }

});