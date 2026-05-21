import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from "react-native";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { LinearGradient } from "expo-linear-gradient";

import {
  MaterialIcons,
  FontAwesome5,
  Entypo
} from "@expo/vector-icons";

import { bdLocations } from "../../data/bdLocation";

export default function ProviderMachineDetails() {
  const [machine, setMachine] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();

  const isBn = i18n.language === "bn";
  const { machineId } = route.params;

  useEffect(() => {
    const docRef = doc(db, "machines", machineId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMachine({
          id: docSnap.id,
          ...docSnap.data()
        });
      }
    });

    return () => unsubscribe();
  }, []);

  /* ================= IMAGE LOGIC ================= */
  const getImage = (type) => {
    if (!type) return require("../../../assets/images/add.png");

    const t = type.toLowerCase();

    if (t === "tractor")
      return require("../../../assets/images/Machines/tractor.png");

    if (t === "powertiller")
      return require("../../../assets/images/Machines/powertiller.png");

    if (t === "reaper")
      return require("../../../assets/images/Machines/reaper.png");

    if (t === "sprayer")
      return require("../../../assets/images/Machines/sprayer.jpg");

    if (t === "thresher")
      return require("../../../assets/images/Machines/thresher.png");

    if (t === "combine harvester")
      return require("../../../assets/images/Machines/combine harvester.png");

    if (t === "bed planter")
      return require("../../../assets/images/Machines/bed planter.png");

    return require("../../../assets/images/add.png");
  };

  /* ================= LOCATION TRANSLATION ================= */

  const getDistrictBn = (districtEn) =>
    bdLocations[districtEn]?.bn || districtEn;

  const getUpazilaBn = (districtEn, upazilaEn) => {
    const district = bdLocations[districtEn];
    if (!district) return upazilaEn;

    const upazila = district.upazilas.find(
      (u) => u.en === upazilaEn
    );

    return upazila ? upazila.bn : upazilaEn;
  };

  const getVillageBn = (districtEn, upazilaEn, villageEn) => {
    const district = bdLocations[districtEn];
    if (!district || !villageEn) return villageEn;

    const upazila = district.upazilas.find(
      (u) => u.en === upazilaEn
    );

    if (!upazila || !upazila.villages) return villageEn;

    const village = upazila.villages.find(
      (v) => v.en === villageEn
    );

    return village ? village.bn : villageEn;
  };

  /* ================= BANGLA NUMBER CONVERTER ================= */
  const toBnNumber = (num) => {
    if (num === null || num === undefined || num === "")
      return t("not_specified");

    const bnDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

    return num
      .toString()
      .split("")
      .map((d) => (isBn ? bnDigits[d] ?? d : d))
      .join("");
  };

  /* ================= LOADING ================= */
  if (!machine) {
    return (
      <View style={styles.loading}>
        <Text>{t("loading") || "Loading..."}</Text>
      </View>
    );
  }

  const imageSource =
    machine.machineImage
      ? { uri: machine.machineImage }
      : getImage(machine.machineType);

  return (
    <LinearGradient colors={["#e8f5e9", "#f5f5f5"]} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 300 }}>

        {/* IMAGE */}
        <View style={styles.imageCard}>
          <Image source={imageSource} style={styles.image} />
        </View>

        {/* TITLE */}
        <Text style={styles.title}>
          {t(machine.machineType)}
        </Text>

        {/* MODEL */}
        <View style={styles.card}>
          <FontAwesome5 name="tractor" size={18} color="#4CAF50" />
          <Text style={styles.text}>
            {t("model")}: {machine.machineModel}
          </Text>
        </View>

        {/* CHARGES (TRANSLATED) */}
        <View style={styles.card}>
          <FontAwesome5 name="clock" size={18} color="#4CAF50" />
          <Text style={styles.text}>
            {t("hour_charge")}: {toBnNumber(machine.chargePerHour)} {t("taka")}
          </Text>
        </View>

        <View style={styles.card}>
          <FontAwesome5 name="layer-group" size={18} color="#4CAF50" />
          <Text style={styles.text}>
            {t("decimal_charge")}: {toBnNumber(machine.chargePerDecimal)} {t("taka")}
          </Text>
        </View>

        <View style={styles.card}>
          <FontAwesome5 name="seedling" size={18} color="#4CAF50" />
          <Text style={styles.text}>
            {t("bigha_charge")}: {toBnNumber(machine.chargePerBigha)} {t("taka")}
          </Text>
        </View>

        {/* LOCATION (TRANSLATED) */}
        <View style={styles.card}>
          <Entypo name="home" size={18} color="#4CAF50" />
          <Text style={styles.text}>
            {t("village")}: {getVillageBn(machine.district, machine.upazila, machine.village)}
          </Text>
        </View>

        <View style={styles.card}>
          <MaterialIcons name="location-city" size={18} color="#4CAF50" />
          <Text style={styles.text}>
            {t("upazilla")}: {getUpazilaBn(machine.district, machine.upazila)}
          </Text>
        </View>

        <View style={styles.card}>
          <MaterialIcons name="location-on" size={18} color="#4CAF50" />
          <Text style={styles.text}>
            {t("district")}: {getDistrictBn(machine.district)}
          </Text>
        </View>

        {/* EDIT BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("ProviderEditMachine", { machine })
          }
        >
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {t("edit_details")}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  

  imageCard: {
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 15
  },

  image: {
    width: "100%",
    height: 240
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#2e7d32"
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2
  },

  text: {
    marginLeft: 10,
    fontSize: 15,
    color: "#333"
  },

  button: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8
  }
});