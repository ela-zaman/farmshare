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

/* ================= CLOUDINARY ================= */
const CLOUDINARY_UPLOAD_PRESET = "farm_app_upload";
const CLOUDINARY_CLOUD_NAME = "dnkiqjunx";

export default function EditMachineScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { machine } = route.params;

  /* ================= STATES ================= */
  const [machineType, setMachineType] = useState(machine.machineType || "");
  const [machineModel, setMachineModel] = useState(machine.machineModel || "");

  const [chargePerHour, setChargePerHour] = useState(machine.chargePerHour || "");
  const [chargePerDecimal, setChargePerDecimal] = useState(machine.chargePerDecimal || "");
  const [chargePerBigha, setChargePerBigha] = useState(machine.chargePerBigha || "");

  const [village, setVillage] = useState(machine.village || "");
  const [upazila, setUpazila] = useState(machine.upazila || "");
  const [district, setDistrict] = useState(machine.district || "");

  const [machineImage, setMachineImage] = useState(machine.machineImage || "");

  /* ================= PICK IMAGE ================= */
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

  /* ================= CLOUDINARY UPLOAD ================= */
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
      throw new Error(data.error?.message || "Image upload failed");
    }

    return data.secure_url;
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "machines", machine.id);

      let finalImage = machine.machineImage;

      // if user changed image → upload
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

      Alert.alert("Success", "Machine updated successfully");
      navigation.goBack();

    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 200 }}>

      <Text style={styles.title}>Edit Machine Details</Text>

      {/* IMAGE */}
      <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
        {machineImage ? (
          <Image source={{ uri: machineImage }} style={styles.image} />
        ) : (
          <Text>Select Image</Text>
        )}
      </TouchableOpacity>

      {/* TYPE */}
      <Text style={styles.label}>Machine Type</Text>
      <Picker selectedValue={machineType} onValueChange={setMachineType}>
        <Picker.Item label="Tractor" value="tractor" />
        <Picker.Item label="Powertiller" value="powertiller" />
        <Picker.Item label="Reaper" value="reaper" />
        <Picker.Item label="Bed Planter" value="bed planter" />
        <Picker.Item label="Combine Harvester" value="combine harvester" />
        <Picker.Item label="Thresher" value="thresher" />
        <Picker.Item label="Sprayer" value="sprayer" />
      </Picker>

      {/* MODEL */}
      <Text style={styles.label}>Machine Model</Text>
      <TextInput
        value={machineModel}
        onChangeText={setMachineModel}
        style={styles.input}
      />

      {/* CHARGES */}
      <Text style={styles.label}>Hour Charge</Text>
      <TextInput
        value={chargePerHour}
        onChangeText={setChargePerHour}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Decimal Charge</Text>
      <TextInput
        value={chargePerDecimal}
        onChangeText={setChargePerDecimal}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Bigha Charge</Text>
      <TextInput
        value={chargePerBigha}
        onChangeText={setChargePerBigha}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* LOCATION */}
      <Text style={styles.label}>Village</Text>
      <TextInput value={village} onChangeText={setVillage} style={styles.input} />

      <Text style={styles.label}>Upazila</Text>
      <TextInput value={upazila} onChangeText={setUpazila} style={styles.input} />

      <Text style={styles.label}>District</Text>
      <TextInput value={district} onChangeText={setDistrict} style={styles.input} />

      {/* BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Machine</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({

  container: {
    padding: 20,
    flexGrow: 1
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15
  },

  imageBox: {
    height: 180,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },

  image: {
    width: "100%",
    height: "100%"
  },

  label: {
    fontWeight: "bold",
    marginTop: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  },

  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  }
});