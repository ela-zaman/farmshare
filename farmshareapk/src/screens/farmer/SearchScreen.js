import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";

import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function SearchScreen({ navigation }) {
  const { t } = useTranslation();

  const [machineType, setMachineType] = useState(null);

  // =====================================================
  // MACHINE TYPES
  // =====================================================

  const machineTypes = [
    {
      label: t("tractor"),
      value: "tractor",
    },
    {
      label: t("powertiller"),
      value: "powertiller",
    },
    {
      label: t("reaper"),
      value: "reaper",
    },
    {
      label: t("bed_planter"),
      value: "bed_planter",
    },
    {
      label: t("combine_harvester"),
      value: "combine_harvester",
    },
    {
      label: t("thresher"),
      value: "thresher",
    },
    {
      label: t("sprayer"),
      value: "sprayer",
    },
  ];

  // =====================================================
  // SEARCH BUTTON
  // =====================================================

  const handleSearch = async () => {
    try {
      const user = auth.currentUser;

      // Check whether user is logged in
      if (!user) {
        return Alert.alert(
          t("error"),
          t("user_not_logged_in")
        );
      }

      // Check whether machine type is selected
      if (!machineType) {
        return Alert.alert(
          t("error"),
          t("select_machine_type")
        );
      }

      // =================================================
      // FETCH USER LOCATION
      // =================================================

      const userRef = doc(db, "users", user.uid);

      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        return Alert.alert(
          t("error"),
          "User data not found"
        );
      }

      const userData = snap.data();

      const district = userData?.district;
      const upazilla = userData?.upazila;

      // =================================================
      // VALIDATION
      // =================================================

      if (!district || !upazilla) {
        return Alert.alert(
          t("error"),
          "Please complete your profile (district & upazila)"
        );
      }

      // =================================================
      // NAVIGATE TO SEARCH RESULT
      // =================================================

      navigation.navigate("SearchResult", {
        machineType,
        district,
        upazilla,
      });

    } catch (error) {
      console.log("Search Error:", error);

      Alert.alert(
        t("error"),
        error.message
      );
    }
  };

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >

      {/* ================================================= */}
      {/* PAGE TITLE                                        */}
      {/* ================================================= */}

      <Text style={styles.title}>
        {t("farm_machine")}
      </Text>

      {/* ================================================= */}
      {/* IMAGE SECTION                                     */}
      {/* ================================================= */}
      {/*
        ---------------------------------------------------
        DUMMY IMAGE LOCATION

        Put your image here:

        assets/images/search-machine.jpg

        Then replace the image whenever you want.
        ---------------------------------------------------
      */}

      <Image
        source={require("../../../assets/images/search-machine.png")}
        style={styles.locationImage}
        resizeMode="contain"
      />

      {/* ================================================= */}
      {/* IMAGE DESCRIPTION (OPTIONAL)                     */}
      {/* ================================================= */}

     
      {/* ================================================= */}
      {/* MACHINE TYPE LABEL                                */}
      {/* ================================================= */}

      <Text style={styles.label}>
        {t("select_machine_type")}
      </Text>

      {/* ================================================= */}
      {/* MACHINE TYPE DROPDOWN                             */}
      {/* ================================================= */}

      <Dropdown
        style={styles.dropdown}
        data={machineTypes}
        labelField="label"
        valueField="value"
        placeholder={t("select_machine_type")}
        value={machineType}
        onChange={(item) => {
          setMachineType(item.value);
        }}
        selectedTextStyle={styles.selectedText}
        placeholderStyle={styles.placeholderText}
      />

      {/* ================================================= */}
      {/* SEARCH BUTTON                                     */}
      {/* ================================================= */}

      <TouchableOpacity
        style={styles.searchBtn}
        onPress={handleSearch}
        activeOpacity={0.8}
      >
        <Text style={styles.searchText}>
          {t("search")}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  // -------------------------------------------------------
  // MAIN CONTAINER
  // -------------------------------------------------------

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // -------------------------------------------------------
  // SCROLL CONTENT
  // -------------------------------------------------------

  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },

  // -------------------------------------------------------
  // PAGE TITLE
  // -------------------------------------------------------

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#222222",
  },

  // -------------------------------------------------------
  // IMAGE
  // -------------------------------------------------------

  locationImage: {
    width: "100%",
    height: 180,
    borderRadius: 15,
    marginBottom: 10,
  },

  // -------------------------------------------------------
  // IMAGE CAPTION
  // -------------------------------------------------------

  imageCaption: {
    fontSize: 15,
    textAlign: "center",
    color: "#666666",
    marginBottom: 25,
  },

  // -------------------------------------------------------
  // DROPDOWN LABEL
  // -------------------------------------------------------

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },

  // -------------------------------------------------------
  // DROPDOWN
  // -------------------------------------------------------

  dropdown: {
    height: 52,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 25,
    backgroundColor: "#FFFFFF",
  },

  selectedText: {
    fontSize: 15,
    color: "#222222",
  },

  placeholderText: {
    fontSize: 15,
    color: "#888888",
  },

  // -------------------------------------------------------
  // SEARCH BUTTON
  // -------------------------------------------------------

  searchBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  // -------------------------------------------------------
  // SEARCH TEXT
  // -------------------------------------------------------

  searchText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

});