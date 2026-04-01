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
  Dimensions,
  Image,
  ActivityIndicator
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { registerUser } from "../../firebase/authService";

const { width } = Dimensions.get("window");

// 🔑 Cloudinary config
const CLOUD_NAME = "dnkiqjunx";
const UPLOAD_PRESET = "farm_app_upload";

export default function RegisterScreen({ navigation, route }) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const role = route.params?.role || "farmer";
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

  // 📸 Pick Image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ☁️ Upload to Cloudinary
  const uploadImageToCloudinary = async () => {
    if (!image) return null;

    const data = new FormData();

    data.append("file", {
      uri: image,
      type: "image/jpeg",
      name: "profile.jpg"
    });

    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data
        }
      );

      const result = await res.json();

      if (result.secure_url) {
        return result.secure_url;
      } else {
        console.log("Cloudinary Error:", result);
        return null;
      }
    } catch (error) {
      console.log("Upload Error:", error);
      return null;
    }
  };

  // 📝 Register
  const handleRegister = async () => {
    if (!name || !phone || !address || !password) {
      return Alert.alert(t("error"), t("fill_fields"));
    }

    if (!image) {
      return Alert.alert(t("error"), "Please select a profile image");
    }

    setLoading(true);

    try {
      // 🔥 Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary();

      if (!imageUrl) {
        setLoading(false);
        return Alert.alert("Error", "Image upload failed");
      }

      // 🔥 Save in Firebase
      await registerUser({
        name,
        phone,
        address,
        password,
        role,
        photo: imageUrl
      });

      Alert.alert(t("success"), t("registration_success"));

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }]
      });

    } catch (error) {
      Alert.alert(t("registration_failed"), error.message);
    }

    setLoading(false);
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

      {/* 📸 PROFILE IMAGE */}
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profileImage} />
        ) : (
          <Text style={{ color: "#fff" }}>Select Photo</Text>
        )}
      </TouchableOpacity>

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

      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t("register")}</Text>
          )}
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

  imageContainer: {
    alignSelf: "center",
    marginBottom: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },

  profileImage: {
    width: "100%",
    height: "100%"
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
    elevation: 5
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  }
});