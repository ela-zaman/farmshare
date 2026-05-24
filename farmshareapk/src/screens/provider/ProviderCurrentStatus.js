import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function ProviderCurrentStatus() {
  const [machines, setMachines] = useState([]);
  const navigation = useNavigation();
  const { t } = useTranslation();

  /* ================= FETCH ================= */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "machines"),
      where("providerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMachines(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  /* ================= MACHINE LOCAL IMAGE ================= */
  const getMachineImage = (type) => {
    if (!type) return require("../../../assets/images/add.png");

    const t = type.toLowerCase();

    switch (t) {
      case "tractor":
        return require("../../../assets/images/Machines/tractor.png");
      case "powertiller":
        return require("../../../assets/images/Machines/powertiller.png");
      case "reaper":
        return require("../../../assets/images/Machines/reaper.png");
      case "sprayer":
        return require("../../../assets/images/Machines/sprayer.jpg");
      case "thresher":
        return require("../../../assets/images/Machines/thresher.png");
      case "combine harvester":
        return require("../../../assets/images/Machines/combine harvester.png");
      case "bed planter":
        return require("../../../assets/images/Machines/bed planter.png");
      default:
        return require("../../../assets/images/add.png");
    }
  };

  /* ================= CLOUDINARY IMAGE HANDLING ================= */
  const getMachineCloudImage = (url) => {
    if (url && url.length > 0) {
      return { uri: url };
    }
    return null;
  };

  /* ================= RENDER CARD ================= */
  const renderCard = (machine) => {
    const cloudImage = getMachineCloudImage(machine.machineImage);
    const localImage = getMachineImage(machine.machineType);

    return (
      <TouchableOpacity
        key={machine.id}
        style={styles.card}
        onPress={() =>
          navigation.navigate("MachineStatus", {
            machineId: machine.id,
            machineType: machine.machineType,
          })
        }
      >
        {/* IMAGE TOP */}
        <View style={styles.imageContainer}>
          <Image
            source={cloudImage || localImage}
            style={styles.image}
          />
        </View>

        {/* MACHINE TYPE BOTTOM CENTER */}
        <View style={styles.bottomBox}>
          <Text style={styles.machineType}>
            {t(machine.machineType)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {machines.length === 0 ? (
        <Text style={styles.emptyText}>{t("no_machines")}</Text>
      ) : (
        machines.map(renderCard)
      )}
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 120,
    backgroundColor: "#f5f5f5",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777",
  },

  /* GREEN GRADIENT LOOK */
  card: {
    borderRadius: 18,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "#dff5e1",
    elevation: 4,
  },

  imageContainer: {
    backgroundColor: "#c8e6c9",
    padding: 10,
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 140,
    resizeMode: "contain",
  },

  bottomBox: {
    paddingVertical: 10,
    backgroundColor: "#2e7d32",
    alignItems: "center",
  },

  machineType: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});