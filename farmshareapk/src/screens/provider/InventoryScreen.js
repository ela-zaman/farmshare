import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

export default function InventoryScreen() {
  const [machines, setMachines] = useState([]);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const isBn = i18n.language === "bn";

  /* ================= FETCH ================= */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "machines"),
      where("providerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMachines(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  /* ================= NORMALIZE TYPE ================= */
  const normalize = (type) => {
    if (!type) return "";
    return type.toLowerCase().replace(/[_-]/g, " ").trim();
  };

  /* ================= IMAGE LOGIC ================= */
  const getImage = (machine) => {
    if (machine?.machineImage) {
      return { uri: machine.machineImage };
    }

    const type = normalize(machine?.machineType);

    if (type === "tractor")
      return require("../../../assets/images/Machines/tractor.png");

    if (type === "powertiller")
      return require("../../../assets/images/Machines/powertiller.png");

    if (type === "reaper")
      return require("../../../assets/images/Machines/reaper.png");

    if (type === "sprayer")
      return require("../../../assets/images/Machines/sprayer.jpg");

    if (type === "thresher")
      return require("../../../assets/images/Machines/thresher.png");

    if (type === "combine harvester")
      return require("../../../assets/images/Machines/combine harvester.png");

    if (type === "bed planter")
      return require("../../../assets/images/Machines/bed planter.png");

    return require("../../../assets/images/Machines/bed planter.png");
  };

  /* ================= BENGALI NUMBER CONVERTER ================= */
  const toBanglaNumber = (num) => {
    const bnDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

    return num
      .toString()
      .split("")
      .map((d) => (bnDigits[d] !== undefined ? bnDigits[d] : d))
      .join("");
  };

  const formatCharge = (value) => {
    if (value === null || value === undefined || value === "")
      return t("not_specified");

    const str = value.toString();
    return isBn ? toBanglaNumber(str) : str;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* HEADER */}
        <Text style={styles.title}>
          {t("choose_machine_to_edit")}
        </Text>

        {/* GRID */}
        <View style={styles.grid}>
          {machines.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("ProviderMachineDetails", {
                  machineId: item.id
                })
              }
            >

              {/* IMAGE */}
              <Image source={getImage(item)} style={styles.image} />

              {/* TYPE */}
              <Text style={styles.type}>
                {t(item.machineType)}
              </Text>

              {/* MODEL */}
              <Text style={styles.text}>
                {t("model")}: {item.machineModel}
              </Text>

              {/* CHARGES */}
              <Text style={styles.text}>
                {t("hour_charge")}: {formatCharge(item.chargePerHour)} {t("taka")}
              </Text>

              <Text style={styles.text}>
                {t("decimal_charge")}: {formatCharge(item.chargePerDecimal)} {t("taka")}
              </Text>

              <Text style={styles.text}>
                {t("bigha_charge")}: {formatCharge(item.chargePerBigha)} {t("taka")}
              </Text>

            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({

  container: {
    padding: 12,
    paddingBottom: 120
  },

  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    elevation: 3
  },

  image: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: "cover"
  },

  type: {
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center"
  },

  text: {
    fontSize: 12,
    color: "#444",
    marginBottom: 2
  }
});