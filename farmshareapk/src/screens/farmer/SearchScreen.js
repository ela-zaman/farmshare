import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";

import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function SearchScreen({ navigation }) {
  const { t } = useTranslation();

  const [machineType, setMachineType] = useState(null);

  // MACHINE TYPES
  const machineTypes = [
    { label: t("tractor"), value: "tractor" },
    { label: t("powertiller"), value: "powertiller" },
    { label: t("reaper"), value: "reaper" },
    { label: t("bed_planter"), value: "bed_planter" },
    { label: t("combine_harvester"), value: "combine_harvester" },
    { label: t("thresher"), value: "thresher" },
    { label: t("sprayer"), value: "sprayer" }
  ];

  // ✅ SEARCH BUTTON (UPDATED)
  const handleSearch = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        return Alert.alert(t("error"), t("user_not_logged_in"));
      }

      if (!machineType) {
        return Alert.alert(t("error"), t("select_machine_type"));
      }

      // ✅ FETCH USER LOCATION
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        return Alert.alert(t("error"), "User data not found");
      }

      const userData = snap.data();

      const district = userData?.district;
      const upazilla = userData?.upazila;

      // ✅ VALIDATION
      if (!district || !upazilla) {
        return Alert.alert(
          t("error"),
          "Please complete your profile (district & upazila)"
        );
      }

      // ✅ NAVIGATE WITH AUTO LOCATION
      navigation.navigate("SearchResult", {
        machineType,
        district,
        upazilla
      });

    } catch (error) {
      console.log("Search Error:", error);
      Alert.alert(t("error"), error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("farm_machine")}</Text>

      {/* MACHINE TYPE ONLY */}
      <Dropdown
        style={styles.dropdown}
        data={machineTypes}
        labelField="label"
        valueField="value"
        placeholder={t("select_machine_type")}
        value={machineType}
        onChange={(item) => setMachineType(item.value)}
      />

      {/* SEARCH BUTTON */}
      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchText}>{t("search")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center"
  },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20
  },
  searchBtn: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center"
  },
  searchText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  }
});