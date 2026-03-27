import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Dimensions
} from "react-native";
import { useTranslation } from "react-i18next";
import { registerUser } from "../../firebase/authService";

const { width } = Dimensions.get("window");

export default function RegisterScreen({ navigation, route }) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const role = route.params?.role || "farmer";

  // Floating animation for the button
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

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
    <ImageBackground
      source={require("../../../assets/images/background6.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <Text style={styles.title}>
        {t("register_as")} {t(role)}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={t("name")}
        placeholderTextColor="blue"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder={t("phone")}
        placeholderTextColor="blue"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder={t("address")}
        placeholderTextColor="blue"
        value={address}
        onChangeText={setAddress}
      />

      <TextInput
        style={styles.input}
        placeholder={t("password")}
        placeholderTextColor="blue"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Floating Register Button */}
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>{t("register")}</Text>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
    backgroundColor: "darkgreen",
    paddingVertical: 10,
    borderRadius: 8
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#000"
  },

  button: {
    backgroundColor: "darkgreen",
    width: width * 0.8,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  }
});