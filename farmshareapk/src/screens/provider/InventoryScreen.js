import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet
} from "react-native";

import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { db, auth } from "../../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function InventoryScreen() {
  const [machines, setMachines] = useState([]);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  // 🔥 Fetch Machines
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "machines"),
      where("providerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const machineList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setMachines(machineList);
      },
      (error) => console.log("Realtime error:", error)
    );

    return () => unsubscribe();
  }, []);

  // 🔥 Image Logic
  const getMachineImage = (machineType) => {
    if (!machineType) return require("../../../assets/images/add.png");
    const type = machineType.toLowerCase();
    if (type === "tractor") return require("../../../assets/images/Machines/tractor.png");
    if (type === "powertiller") return require("../../../assets/images/Machines/powertiller.png");
    if (type === "reaper") return require("../../../assets/images/Machines/reaper.png");
    if (type === "sprayer") return require("../../../assets/images/Machines/sprayer.jpg");
    if (type === "thresher") return require("../../../assets/images/Machines/thresher.png");
    if (type === "combine harvester") return require("../../../assets/images/Machines/combine harvester.png");
    if (type === "bed planter") return require("../../../assets/images/Machines/bed planter.png");
    return require("../../../assets/images/add.png"); // fallback
  };

  // 🔥 Translate Machine Type
  const getMachineTypeLabel = (type) => {
    if (!type) return "";
    const key = type.toLowerCase().replace(/\s/g, "_");
    return t(key);
  };

  // 🔥 Convert number to Bangla digits
  const toBanglaNumber = (num) => {
    if (!num && num !== 0) return t("not_specified");
    const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => bn[d] ?? d).join("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {machines.length === 0 ? (
        <Text style={styles.emptyText}>{t("no_machines")}</Text>
      ) : (
        machines.map((machine) => (
          <TouchableOpacity
            key={machine.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("ProviderMachineDetails", { machineId: machine.id })
            }
          >
            {/* Image */}
            <Image
              source={getMachineImage(machine.machineType)}
              style={styles.image}
            />

            {/* Info */}
            <View style={styles.info}>
              {/* Machine Type (Translated) */}
              <Text style={styles.machineType}>
                {getMachineTypeLabel(machine.machineType)}
              </Text>

              {/* Charge per Decimal */}
              <Text style={styles.chargeInfo}>
                {t("charge_per_decimal")}:{" "}
                {isBn ? toBanglaNumber(machine.chargePerDecimal) : machine.chargePerDecimal ?? t("not_specified")}
              </Text>

              {/* Charge per Bigha */}
              <Text style={styles.chargeInfo}>
                {t("charge_per_bigha")}:{" "}
                {isBn ? toBanglaNumber(machine.chargePerBigha) : machine.chargePerBigha ?? t("not_specified")}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777"
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d0e6ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2
  },

  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  machineType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4
  },

  chargeInfo: {
    fontSize: 14,
    color: "#444",
    marginBottom: 2
  },
});