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

import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";

import { db, auth } from "../../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { bdLocations } from "../../data/bdLocation";

export default function AddMachineScreen() {

  /* -------------------- */
  /* Translation Setup    */
  /* -------------------- */
  const { t, i18n } = useTranslation();

  /* -------------------- */
  /* State Variables      */
  /* -------------------- */
  const [name, setName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [tillageType, setTillageType] = useState("");
  const [tillageCharge, setTillageCharge] = useState("");

  const [district, setDistrict] = useState("");
  const [upazilla, setUpazilla] = useState("");
  const [village, setVillage] = useState("");

  const scrollViewRef = useRef(null);

  /* -------------------- */
  /* Location Data        */
  /* -------------------- */

  // All districts (keys)
  const districts = Object.keys(bdLocations);

  // Selected district object
  const selectedDistrict = bdLocations[district];

  // Upazilas of selected district
  const upazillas = selectedDistrict ? selectedDistrict.upazilas : [];

  /* -------------------- */
  /* Helper Functions     */
  /* -------------------- */

  // Show district name based on language
  const getDistrictLabel = (districtKey) => {
    if (!districtKey) return "";
    return i18n.language === "bn"
      ? bdLocations[districtKey].bn
      : districtKey;
  };

  // Show upazila name based on language
  const getUpazilaLabel = (upazilaObj) => {
    if (!upazilaObj) return "";
    return i18n.language === "bn"
      ? upazilaObj.bn
      : upazilaObj.en;
  };

  /* -------------------- */
  /* Add Machine Function */
  /* -------------------- */

  const handleAddMachine = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert(t("error"), t("user_not_logged_in"));
        return;
      }

      // Validation
      if (
        !name ||
        !machineType ||
        !tillageType ||
        !tillageCharge ||
        !district ||
        !upazilla ||
        !village
      ) {
        Alert.alert(t("error"), t("fill_all_fields"));
        return;
      }

      // Save to Firestore
      await addDoc(collection(db, "machines"), {
        name: name.trim(),
        machineType,
        tillageType,
        tillageCharge,
        district,     // stored in English (key)
        upazilla,     // stored in English
        village,
        providerId: user.uid,
        providerEmail: user.email,
        createdAt: serverTimestamp()
      });

      Alert.alert(t("success"), t("machine_added"));

      // Reset form
      setName("");
      setMachineType("");
      setTillageType("");
      setTillageCharge("");
      setDistrict("");
      setUpazilla("");
      setVillage("");

    } catch (error) {
      console.log("Add Machine Error:", error);
      Alert.alert(t("error"), error.message);
    }
  };

  /* -------------------- */
  /* UI                  */
  /* -------------------- */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>{t("add_machine_title")}</Text>
          <Image
            source={require("../../../assets/images/add.png")}
            style={styles.headerImage}
          />
        </View>

        {/* Machine Name */}
        <Text style={styles.label}>{t("machine_name")}</Text>
        <TextInput
          placeholder={t("enter_machine_name")}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Machine Type */}
        <Text style={styles.label}>{t("machine_type")}</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={machineType} onValueChange={setMachineType}>
            <Picker.Item label={t("select_machine_type")} value="" />
            <Picker.Item label={t("tractor")} value="Tractor" />
            <Picker.Item label={t("powertiller")} value="Powertiller" />
            <Picker.Item label={t("reaper")} value="Reaper" />
            <Picker.Item label={t("bed_planter")} value="Bed Planter" />
            <Picker.Item label={t("combine_harvester")} value="Combine Harvester" />
            <Picker.Item label={t("thresher")} value="Thresher" />
            <Picker.Item label={t("sprayer")} value="Sprayer" />
          </Picker>
        </View>

        {/* Charge Type */}
        <Text style={styles.label}>{t("charge_type")}</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={tillageType} onValueChange={setTillageType}>
            <Picker.Item label={t("select_charge_type")} value="" />
            <Picker.Item label={t("per_decimal")} value="Per Decimal" />
            <Picker.Item label={t("per_bigha")} value="Per Bigha" />
          </Picker>
        </View>

        {/* Charge */}
        <Text style={styles.label}>{t("charge")}</Text>
        <TextInput
          placeholder={t("enter_charge")}
          value={tillageCharge}
          onChangeText={setTillageCharge}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* District */}
        <Text style={styles.label}>{t("district")}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={district}
            onValueChange={(value) => {
              setDistrict(value);
              setUpazilla(""); // reset upazila
            }}
          >
            <Picker.Item label={t("select_district")} value="" />
            {districts.map((d) => (
              <Picker.Item
                key={d}
                label={getDistrictLabel(d)}
                value={d}   // always store English key
              />
            ))}
          </Picker>
        </View>

        {/* Upazila */}
        <Text style={styles.label}>{t("upazila")}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={upazilla}
            onValueChange={setUpazilla}
          >
            <Picker.Item label={t("select_upazila")} value="" />
            {upazillas.map((u) => (
              <Picker.Item
                key={u.en}
                label={getUpazilaLabel(u)}
                value={u.en}   // ✅ ALWAYS STORE ENGLISH (IMPORTANT FIX)
              />
            ))}
          </Picker>
        </View>

        {/* Village */}
        <Text style={styles.label}>{t("village")}</Text>
        <TextInput
          placeholder={t("enter_village")}
          value={village}
          onChangeText={setVillage}
          style={styles.input}
        />

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMachine}
        >
          <Text style={styles.addButtonText}>
            {t("add_machine_button")}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* -------------------- */
/* Styles               */
/* -------------------- */

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
    height: 24,
    resizeMode: "contain"
  },

  label: {
    fontWeight: "bold",
    marginTop: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10
  },

  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold"
  }
});