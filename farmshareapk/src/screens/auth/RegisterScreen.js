import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ImageBackground,
  Animated,
  ScrollView
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

import { registerUser } from "../../firebase/authService";
import { bdLocations } from "../../data/bdLocation";

const CLOUD_NAME = "dnkiqjunx";
const UPLOAD_PRESET = "farm_app_upload";

export default function RegisterScreen({ navigation, route }) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [village, setVillage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const role = route.params?.role || "farmer";
  const floatAnim = useRef(new Animated.Value(0)).current;

  const districtList = Object.keys(bdLocations || {});
  const upazilaList = district ? (bdLocations[district]?.upazilas || []) : [];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === "en" ? "bn" : "en");
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6
    });

    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const uploadImage = async () => {
    if (!image) return null;

    const form = new FormData();
    form.append("file", { uri: image, name: "img.jpg", type: "image/jpeg" });
    form.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleRegister = async () => {
    if (!name || !phone || !district || !upazila || !village || !password || !confirmPassword)
      return alert(t("fill_all_fields"));

    if (password !== confirmPassword)
      return alert(t("password_not_match"));

    setLoading(true);

    try {
      const photoUrl = await uploadImage();

      await registerUser(
        {
          name,
          phone,
          role,
          district,
          upazila,
          village,
          photo: photoUrl
        },
        password
      );

      alert(t("registration_success"));

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }]
      });

    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/background6.png")}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >

        {/* LANGUAGE SWITCH */}
        <TouchableOpacity style={styles.lang} onPress={toggleLang}>
          <Text style={{ color: "#fff" }}>🌐</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {t("register_as")} {t(role)}
        </Text>

        {/* IMAGE */}
        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.img} />
          ) : (
            <Ionicons name="camera" size={30} color="green" />
          )}
        </TouchableOpacity>

        {/* INPUTS */}
        <Input icon="user" value={name} onChangeText={setName} placeholder={t("name")} />
        <Input icon="phone" value={phone} onChangeText={setPhone} placeholder={t("phone")} />

        {/* DISTRICT */}
        <PickerBox
          selected={district}
          setSelected={(v) => { setDistrict(v); setUpazila(""); }}
          list={[
            { label: t("select_district"), value: "" },
            ...(districtList || []).map(d => ({
              label: i18n.language === "bn" ? bdLocations[d]?.bn : d,
              value: d
            }))
          ]}
        />

        {/* UPAZILA */}
        <PickerBox
          selected={upazila}
          setSelected={setUpazila}
          list={[
            { label: t("select_upazila"), value: "" },
            ...(upazilaList || []).map(u => ({
              label: i18n.language === "bn" ? u?.bn : u?.en,
              value: u?.en
            }))
          ]}
        />

        <Input icon="home" value={village} onChangeText={setVillage} placeholder={t("village")} />
        <Input icon="lock" value={password} onChangeText={setPassword} placeholder={t("password")} secure />
        <Input icon="lock" value={confirmPassword} onChangeText={setConfirmPassword} placeholder={t("confirm_password")} secure />

        <TouchableOpacity style={styles.btn} onPress={handleRegister}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>{t("register")}</Text>}
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
}

/* INPUT */
const Input = ({ icon, secure, value, onChangeText, placeholder }) => (
  <View style={styles.inputBox}>
    <FontAwesome name={icon} size={18} color="green" />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="blue"
      secureTextEntry={secure}
    />
  </View>
);

/* PICKER */
const PickerBox = ({ selected, setSelected, list }) => (
  <View style={styles.inputBox}>
    <MaterialIcons name="map" size={18} color="green" />
    <Picker selectedValue={selected} style={{ flex: 1 }} onValueChange={setSelected}>
      {(list || []).map((i, idx) => (
        <Picker.Item key={idx} label={i.label} value={i.value} />
      ))}
    </Picker>
  </View>
);

/* STYLE */
const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 120 },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center"
  },

  lang: { position: "absolute", right: 15, top: 10 },

  imageBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },

  img: { width: "100%", height: "100%", borderRadius: 50 },

  inputBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center"
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: "#000"
  },

  btn: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10
  }
});