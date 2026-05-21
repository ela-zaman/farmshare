import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTranslation } from "react-i18next";
import { Picker } from "@react-native-picker/picker";

import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";

/* ================= CLOUDINARY CONFIG ================= */
const CLOUDINARY_UPLOAD_PRESET = "farm_app_upload";
const CLOUDINARY_CLOUD_NAME = "dnkiqjunx";

export default function AddMachineScreen() {
  const { t } = useTranslation();

  const [machineType, setMachineType] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [machineModel, setMachineModel] = useState("");
  const [machineImage, setMachineImage] = useState(null);

  const [chargePerDecimal, setChargePerDecimal] = useState("");
  const [chargePerBigha, setChargePerBigha] = useState("");
  const [chargePerHour, setChargePerHour] = useState("");

  const scrollViewRef = useRef(null);

  /* ================= IMAGE PICKER ================= */
  const pickImage = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7
      });

    if (!result.canceled) {
      setMachineImage(result.assets[0].uri);
    }
  };

  /* ================= CLOUDINARY UPLOAD ================= */
  const uploadToCloudinary = async (imageUri, userId) => {
    const formData = new FormData();

    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "machine.jpg"
    });

    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `users/${userId}/machines`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    return data.secure_url;
  };

  /* ================= ADD MACHINE ================= */
  const handleAddMachine = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        return Alert.alert(
          t("error"),
          t("user_not_logged_in")
        );
      }

      if (
        !machineType ||
        
        !machineModel ||
        (!chargePerDecimal &&
          !chargePerBigha &&
          !chargePerHour)
      ) {
        return Alert.alert(
          t("error"),
          t("fill_required_fields")
        );
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return Alert.alert(
          t("error"),
          "User data not found"
        );
      }

      const userData = userSnap.data();

      /* ================= UPLOAD IMAGE IF EXISTS ================= */
      let uploadedImageUrl = "";

      if (machineImage) {
        uploadedImageUrl = await uploadToCloudinary(
          machineImage,
          user.uid
        );
      }

      await addDoc(collection(db, "machines"), {
        machineType,
      
        machineModel,

        machineImage: uploadedImageUrl || "",

        chargePerDecimal: chargePerDecimal || "",
        chargePerBigha: chargePerBigha || "",
        chargePerHour: chargePerHour || "",

        district: userData?.district || "",
        upazila: userData?.upazila || "",
        village: userData?.village || "",
        phone: userData?.phone || "",

        providerId: user.uid,
        providerName: userData?.name || "Unknown",
        providerEmail: user.email,
        providerPhoto: userData?.photo || "",

        createdAt: serverTimestamp()
      });

      Alert.alert(
        t("success"),
        t("machine_added")
      );

      setMachineType("");
   
      setMachineModel("");
      setMachineImage(null);
      setChargePerDecimal("");
      setChargePerBigha("");
      setChargePerHour("");

    } catch (error) {
      console.log("Add Machine Error:", error);
      Alert.alert(t("error"), error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>
            {t("add_machine_title")}
          </Text>

          <Image
            source={require("../../../assets/images/add.png")}
            style={styles.headerImage}
          />
        </View>

        {/* Machine Type */}
        <Text style={styles.label}>
          {t("machine_type")}
        </Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={machineType}
            onValueChange={setMachineType}
          >
            <Picker.Item
              label={t("select_machine_type")}
              value=""
            />
            <Picker.Item label={t("tractor")} value="tractor" />
            <Picker.Item label={t("powertiller")} value="powertiller" />
            <Picker.Item label={t("reaper")} value="reaper" />
            <Picker.Item label={t("bed_planter")} value="bed_planter" />
            <Picker.Item label={t("combine_harvester")} value="combine_harvester" />
            <Picker.Item label={t("thresher")} value="thresher" />
            <Picker.Item label={t("sprayer")} value="sprayer" />
          </Picker>
        </View>

        {/* Upload Image */}
        <Text style={styles.label}>
          {t("machine_picture_optional")}
        </Text>

        <TouchableOpacity onPress={pickImage} style={styles.uploadContainer}>
          {machineImage ? (
            <Image
              source={{ uri: machineImage }}
              style={styles.uploadImage}
            />
          ) : (
            <>
              <MaterialCommunityIcons
                name="tractor"
                size={50}
                color="#4CAF50"
              />
              <Text style={styles.uploadText}>
                {t("select_image")}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Machine Model */}
        <Text style={styles.label}>
          {t("machine_model")}
        </Text>

        <TextInput
          value={machineModel}
          onChangeText={setMachineModel}
          style={styles.input}
          placeholder={t("enter_machine_model")}
          placeholderTextColor="blue"
        />

       
        {/* Charges */}
        <Text style={styles.label}>
          {t("charge_per_hour")}
        </Text>

        <TextInput
          value={chargePerHour}
          onChangeText={setChargePerHour}
          keyboardType="numeric"
          style={styles.input}
          placeholder={t( "enter_amount" )}
          placeholderTextColor="blue"
        />

        <Text style={styles.label}>
          {t("charge_per_decimal")}
        </Text>

        <TextInput
          value={chargePerDecimal}
          onChangeText={setChargePerDecimal}
          keyboardType="numeric"
          placeholder={t( "enter_amount" )}
          style={styles.input}
          placeholderTextColor="blue"
        />

        <Text style={styles.label}>
          {t("charge_per_bigha")}
        </Text>

        <TextInput
          value={chargePerBigha}
          onChangeText={setChargePerBigha}
          keyboardType="numeric"
          style={styles.input}
          placeholder={t( "enter_amount" )}
          placeholderTextColor="blue"
        />

        {/* Submit */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMachine}
        >
          <Text style={styles.addButtonText}>
            {t("add_machine_button")}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 10
  },

  headerImage: {
    width: 24,
    height: 24
  },

  label: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
    color: "#000"
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    color: "#000"
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10
  },

  uploadContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#4CAF50",
    alignSelf: "center",
    marginVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },

  uploadImage: {
    width: "100%",
    height: "100%"
  },

  uploadText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center"
  },

  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 25
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold"
  }
});