import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { bdLocations } from "../../data/bdLocation";

/* ================= CLOUDINARY ================= */
const CLOUDINARY_UPLOAD_PRESET = "farm_app_upload";
const CLOUDINARY_CLOUD_NAME = "dnkiqjunx";

export default function EditMachineScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();

  const { machine } = route.params;

  const isBn = i18n.language === "bn";

  /* ================= STATES ================= */
  const [machineType, setMachineType] = useState(machine.machineType || "");
  const [machineModel, setMachineModel] = useState(machine.machineModel || "");

  const [chargePerHour, setChargePerHour] = useState(machine.chargePerHour || "");
  const [chargePerDecimal, setChargePerDecimal] = useState(machine.chargePerDecimal || "");
  const [chargePerBigha, setChargePerBigha] = useState(machine.chargePerBigha || "");

  const [village] = useState(machine.village || "");
  const [upazila] = useState(machine.upazila || "");
  const [district] = useState(machine.district || "");

  const [machineImage, setMachineImage] = useState(machine.machineImage || "");

  /* ================= IMAGE PICK ================= */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7
    });

    if (!result.canceled) {
      setMachineImage(result.assets[0].uri);
    }
  };

  /* ================= CLOUDINARY ================= */
  const uploadToCloudinary = async (imageUri) => {
    const formData = new FormData();

    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "machine.jpg"
    });

    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url;
  };

  /* ================= LOCATION TRANSLATION FIX ================= */

  const getDistrictName = (en) => {
    if (!en) return "";
    return isBn ? (bdLocations[en]?.bn || en) : en;
  };

  const getUpazilaName = (districtEn, upazilaEn) => {
    if (!districtEn || !upazilaEn) return upazilaEn;

    if (!isBn) return upazilaEn;

    const district = bdLocations[districtEn];
    if (!district) return upazilaEn;

    const upazila = district.upazilas.find(
      (u) => u.en === upazilaEn
    );

    return upazila ? upazila.bn : upazilaEn;
  };

  const getVillageName = (districtEn, upazilaEn, villageEn) => {
    if (!isBn) return villageEn;
    if (!districtEn || !upazilaEn || !villageEn) return villageEn;

    const district = bdLocations[districtEn];
    if (!district) return villageEn;

    const up = district.upazilas.find(u => u.en === upazilaEn);
    if (!up || !up.villages) return villageEn;

    const village = up.villages.find(v => v.en === villageEn);
    return village ? village.bn : villageEn;
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "machines", machine.id);

      let finalImage = machine.machineImage;

      if (machineImage && machineImage !== machine.machineImage) {
        finalImage = await uploadToCloudinary(machineImage);
      }

      await updateDoc(docRef, {
        machineType,
        machineModel,
        machineImage: finalImage,
        chargePerHour,
        chargePerDecimal,
        chargePerBigha,
        village,
        upazila,
        district
      });

      Alert.alert(t("success"), t("machine_updated"));
      navigation.goBack();

    } catch (error) {
      Alert.alert(t("error"), error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>

      <Text style={styles.title}>
        {t("edit_machine_details")}
      </Text>

      {/* IMAGE */}
      <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
        {machineImage ? (
          <Image source={{ uri: machineImage }} style={styles.image} />
        ) : (
          <Text>{t("select_image")}</Text>
        )}
      </TouchableOpacity>

      {/* TYPE */}
      <Text style={styles.label}>{t("machine_type")}</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={machineType} onValueChange={setMachineType}>
          <Picker.Item label={t("tractor")} value="tractor" />
          <Picker.Item label={t("powertiller")} value="powertiller" />
          <Picker.Item label={t("reaper")} value="reaper" />
          <Picker.Item label={t("sprayer")} value="sprayer" />
          <Picker.Item label={t("thresher")} value="thresher" />
        </Picker>
      </View>

      {/* MODEL */}
      <Text style={styles.label}>{t("machine_model")}</Text>
      <TextInput value={machineModel} onChangeText={setMachineModel} style={styles.input} />

      {/* CHARGES */}
      <Text style={styles.label}>{t("charge_per_hour")}</Text>
      <TextInput value={chargePerHour} onChangeText={setChargePerHour} style={styles.input} />

      <Text style={styles.label}>{t("charge_per_decimal")}</Text>
      <TextInput value={chargePerDecimal} onChangeText={setChargePerDecimal} style={styles.input} />

      <Text style={styles.label}>{t("charge_per_bigha")}</Text>
      <TextInput value={chargePerBigha} onChangeText={setChargePerBigha} style={styles.input} />

      {/* LOCATION (TRANSLATED DISPLAY FIX) */}
      <Text style={styles.label}>{t("village")}</Text>
      <Text style={styles.readOnly}>
        {getVillageName(machine.district, machine.upazila, village)}
      </Text>

      <Text style={styles.label}>{t("upazila")}</Text>
      <Text style={styles.readOnly}>
        {getUpazilaName(machine.district, upazila)}
      </Text>

      <Text style={styles.label}>{t("district")}</Text>
      <Text style={styles.readOnly}>
        {getDistrictName(district)}
      </Text>

      {/* BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>
          {t("update_machine")}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },

  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },

  imageBox: {
    height: 180,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderRadius: 10
  },

  image: { width: "100%", height: "100%", borderRadius: 10 },

  label: { fontWeight: "bold", marginTop: 12 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },

  readOnly: {
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 10
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10
  },

  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 25
  },

  buttonText: { color: "#fff", fontWeight: "bold" }
});