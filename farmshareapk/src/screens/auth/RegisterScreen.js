import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { registerUser } from "../../firebase/authService";

export default function RegisterScreen({ navigation, route }) {

  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const role = route.params?.role || "farmer";

  const handleRegister = async () => {

    if (!name || !phone || !address || !password) {
      return Alert.alert(t("error"), t("fill_fields"));
    }

    try {

      await registerUser({
        name,
        phone,
        address,
        password,
        role
      });

      Alert.alert(t("success"), t("registration_success"));

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }]
      });

    } catch (error) {
      Alert.alert(t("registration_failed"), error.message);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        {t("register_as")} {t(role)}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={t("name")}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder={t("phone")}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder={t("address")}
        value={address}
        onChangeText={setAddress}
      />

      <TextInput
        style={styles.input}
        placeholder={t("password")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={t("register")}
        onPress={handleRegister}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F5F5F5"
  },

  title: {
    fontSize: 20,
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
    borderColor: "#ccc"
  }

});