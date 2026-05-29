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

import { registerForPushNotificationsAsync } 
from "../../services/notificationService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {

  const { t } = useTranslation();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const floatAnim = useRef(new Animated.Value(0)).current;

  /* ================= FLOAT ANIMATION ================= */
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

  /* ================= LOGIN HANDLER ================= */
  const handleLogin = async () => {

    if (!phone || !password) {
      return Alert.alert(t("error"), t("fill_fields"));
    }

    try {
      const userData = await loginUser({ phone, password });

      const user = userData.user;
      const role = userData.role;

      /* ================= PUSH NOTIFICATION SETUP ================= */
      const token = await registerForPushNotificationsAsync();

      if (token && user?.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          expoPushToken: token,
        });
      }

      /* ================= NAVIGATION ================= */
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
      source={require("../../../assets/images/background5.png")}
      style={styles.container}
      resizeMode="cover"
    >

      {/* LOGO */}
      <Image
        source={require("../../../assets/logo/Logo.png")}
        style={styles.logo}
      />

      {/* TITLE */}
      <Text style={styles.title}>
        {t("login_to_app")}
      </Text>

      {/* PHONE */}
      <TextInput
        style={styles.input}
        placeholder={t("phone")}
        placeholderTextColor="blue"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* PASSWORD */}
      <TextInput
        style={styles.input}
        placeholder={t("password")}
        placeholderTextColor="blue"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* LOGIN BUTTON */}
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>
            {t("login")}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* REGISTER BUTTON */}
      <Animated.View
        style={{
          transform: [{ translateY: floatAnim }],
          marginTop: 20,
        }}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("RoleSelection")
          }
        >
          <Text style={styles.buttonText}>
            {t("open_new_account")}
          </Text>
        </TouchableOpacity>
      </Animated.View>

    </ImageBackground>
  );
}

/* ================= STYLES ================= */
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