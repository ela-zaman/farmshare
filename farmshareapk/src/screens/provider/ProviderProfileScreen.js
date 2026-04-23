import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { db, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

import { useTranslation } from "react-i18next";
import i18n from "i18next";

import { bdLocations } from "../../data/bdLocation"; // ✅ correct import

const CLOUD_NAME = "dnkiqjunx";
const UPLOAD_PRESET = "farm_app_upload";

export default function ProviderProfileScreen() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [village, setVillage] = useState("");
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  // ================= LOAD USER =================
  const loadUser = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();

        setName(data.name || "");
        setPhone(data.phone || "");
        setDistrict(data.district || "");
        setUpazila(data.upazila || "");
        setVillage(data.village || "");
        setPhoto(data.photo || null);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  // ================= LANGUAGE SWITCH =================
  const toggleLang = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
  };

  // ================= TRANSLATION =================

  const getDistrictName = () => {
    if (!district) return "";

    const data = bdLocations[district];
    if (!data) return district;

    return i18n.language === "bn" ? data.bn : district;
  };

  const getUpazilaName = () => {
    if (!district || !upazila) return "";

    const data = bdLocations[district];
    if (!data) return upazila;

    const found = data.upazilas.find((u) => u.en === upazila);

    if (!found) return upazila;

    return i18n.language === "bn" ? found.bn : found.en;
  };

  // ================= IMAGE =================

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6
    });

    if (!res.canceled) {
      setPhoto(res.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!photo || !photo.startsWith("file")) return photo;

    const form = new FormData();
    form.append("file", {
      uri: photo,
      name: "profile.jpg",
      type: "image/jpeg"
    });

    form.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );

    const data = await res.json();
    return data.secure_url;
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const imageUrl = await uploadImage();

      await updateDoc(doc(db, "users", user.uid), {
        name,
        phone,
        district,
        upazila,
        village,
        photo: imageUrl
      });

      Alert.alert("Success", "Profile updated");
      setEdit(false);
      loadUser();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* 🌐 Language Switch */}
      <TouchableOpacity style={styles.langBtn} onPress={toggleLang}>
        <Text style={{ color: "#fff" }}>
          {i18n.language === "en" ? "বাংলা" : "EN"}
        </Text>
      </TouchableOpacity>

      {/* PHOTO */}
      <View style={styles.photoBox}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <Ionicons name="person-circle" size={120} color="#ccc" />
        )}

        {edit && (
          <TouchableOpacity onPress={pickImage}>
            <Text style={{ color: "green" }}>Change Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* FIELDS */}
      <Field label={t("name")} value={name} set={setName} edit={edit} icon="person" />
      <Field label={t("phone")} value={phone} set={setPhone} edit={edit} icon="call" />

      <Field
        label={t("district")}
        value={getDistrictName()}
        edit={false}
        icon="location"
      />

      <Field
        label={t("upazila")}
        value={getUpazilaName()}
        edit={false}
        icon="map"
      />

      <Field label={t("village")} value={village} set={setVillage} edit={edit} icon="home" />

      {/* BUTTON */}
      {!edit ? (
        <TouchableOpacity style={styles.btn} onPress={() => setEdit(true)}>
          <Text style={{ color: "#fff" }}>{t("edit_profile")}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <Text style={{ color: "#fff" }}>{t("save_changes")}</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

/* ================= FIELD ================= */
const Field = ({ label, value, set, edit, icon }) => (
  <View style={styles.item}>
    <Ionicons name={icon} size={22} color="green" />
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={styles.label}>{label}</Text>

      {edit && set ? (
        <TextInput value={value} onChangeText={set} style={styles.input} />
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 200,
    backgroundColor: "#f5f5f5",
    flexGrow: 1
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  langBtn: {
    position: "absolute",
    right: 15,
    top: 10,
    backgroundColor: "green",
    padding: 6,
    borderRadius: 6,
    zIndex: 10
  },

  photoBox: {
    alignItems: "center",
    marginBottom: 20
  },

  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "green"
  },

  item: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center"
  },

  label: {
    fontSize: 13,
    color: "#666"
  },

  value: {
    fontSize: 16,
    color: "#000"
  },

  input: {
    borderBottomWidth: 1,
    borderColor: "green",
    fontSize: 16
  },

  btn: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20
  }
});