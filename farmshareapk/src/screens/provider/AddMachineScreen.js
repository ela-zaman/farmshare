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
import { useTranslation } from "react-i18next";
import { Picker } from "@react-native-picker/picker";

import { db, auth } from "../../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

export default function AddMachineScreen() {
  const { t } = useTranslation();

  const [machineType, setMachineType] = useState("");
  const [chargePerDecimal, setChargePerDecimal] = useState("");
  const [chargePerBigha, setChargePerBigha] = useState("");

  const scrollViewRef = useRef(null);

  const handleAddMachine = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return Alert.alert(t("error"), t("user_not_logged_in"));

      // ✅ VALIDATION
      if (!machineType || (!chargePerDecimal && !chargePerBigha)) {
        return Alert.alert(t("error"), t("fill_all_fields"));
      }

      // ✅ FETCH USER DATA
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return Alert.alert(t("error"), "User data not found");
      }

      const userData = userSnap.data();

      const district = userData?.district || "";
      const upazila = userData?.upazila || "";
      const village = userData?.village || "";
      const phone = userData?.phone || "";
      const providerName = userData?.name || "Unknown";

      // ✅ NEW: provider photo from Cloudinary
      const providerPhoto = userData?.photo || "";

      if (!district || !upazila || !village) {
        return Alert.alert(
          t("error"),
          "Please complete your profile (district, upazila, village)"
        );
      }

      // ✅ SAVE MACHINE (UPDATED)
      await addDoc(collection(db, "machines"), {
        machineType,
        chargePerDecimal: chargePerDecimal || "",
        chargePerBigha: chargePerBigha || "",

        district,
        upazila,
        village,

        phone,
        providerId: user.uid,
        providerName,
        providerEmail: user.email,

        // ✅ NEW FIELD ADDED
        providerPhoto,

        createdAt: serverTimestamp()
      });

      Alert.alert(t("success"), t("machine_added"));

      // RESET
      setMachineType("");
      setChargePerDecimal("");
      setChargePerBigha("");

    } catch (error) {
      console.log("Add Machine Error:", error);
      Alert.alert(t("error"), error.message);
    }
  };

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

        {/* Machine Type */}
        <Text style={styles.label}>{t("machine_type")}</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={machineType} onValueChange={setMachineType}>
            <Picker.Item label={t("select_machine_type")} value="" />
            <Picker.Item label={t("tractor")} value="tractor" />
            <Picker.Item label={t("powertiller")} value="powertiller" />
            <Picker.Item label={t("reaper")} value="reaper" />
            <Picker.Item label={t("bed_planter")} value="bed_planter" />
            <Picker.Item label={t("combine_harvester")} value="combine_harvester" />
            <Picker.Item label={t("thresher")} value="thresher" />
            <Picker.Item label={t("sprayer")} value="sprayer" />
          </Picker>
        </View>

        {/* Charge Per Decimal */}
        <Text style={styles.label}>{t("charge_per_decimal")}</Text>
        <TextInput
          placeholder={t("enter_amount")}
          value={chargePerDecimal}
          onChangeText={setChargePerDecimal}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Charge Per Bigha */}
        <Text style={styles.label}>{t("charge_per_bigha")}</Text>
        <TextInput
          placeholder={t("enter_amount")}
          value={chargePerBigha}
          onChangeText={setChargePerBigha}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddMachine}>
          <Text style={styles.addButtonText}>{t("add_machine_button")}</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20
  },
  header: { fontSize: 22, fontWeight: "bold", marginRight: 10 },
  headerImage: { width: 24, height: 24 },
  label: { fontWeight: "bold", marginTop: 10, color: "#000" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: "#000"
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