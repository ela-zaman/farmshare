import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { loginUser } from "../../firebase/authService";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {

  const { t } = useTranslation();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Floating animation
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!phone || !password) {
      return Alert.alert(t("error"), t("fill_fields"));
    }

    try {
      const userData = await loginUser({ phone, password });
      const role = userData.role;

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
    <ImageBackground
      source={require("../../../assets/images/background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Logo at top */}
      <Image
        source={require("../../../assets/logo/Logo.png")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>{t("login_to_app")}</Text>

      {/* Phone Input */}
      <TextInput
        style={styles.input}
        placeholder={t("phone")}
        placeholderTextColor="blue"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder={t("password")}
        placeholderTextColor="blue"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Login Button */}
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>{t("login")}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Register Button */}
      <Animated.View style={{ transform: [{ translateY: floatAnim }], marginTop: 20 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("RoleSelection")}
        >
          <Text style={styles.buttonText}>{t("open_new_account")}</Text>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },

  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginTop: 40,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
    backgroundColor: "darkgreen",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  input: {
    width: width * 0.85,
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#000",
  },

  button: {
    backgroundColor: "darkgreen",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: width * 0.7,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});