import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function ProviderCurrentStatus() {
  const [machines, setMachines] = useState([]);

  const navigation = useNavigation();
  const { t } = useTranslation();

  /* ================= FETCH MACHINES ================= */
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

  /* ================= LOCAL MACHINE IMAGES ================= */
  const getMachineImage = (type) => {
    if (!type) {
      return require("../../../assets/images/add.png");
    }

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

  /* ================= CLOUD IMAGE ================= */
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
        activeOpacity={0.92}
        style={styles.cardWrapper}
        onPress={() =>
          navigation.navigate("MachineStatus", {
            machineId: machine.id,
            machineType: machine.machineType,
          })
        }
      >
        <LinearGradient
          colors={[
            "#ffd6ec",
            "#f7d9ff",
            "#dce7ff",
            "#c8f1ff",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* GLOW CIRCLE */}
          <View style={styles.glowCircle} />

          {/* IMAGE SECTION */}
          <View style={styles.imageContainer}>
            <Image
              source={cloudImage || localImage}
              style={styles.image}
            />
          </View>

          {/* INFO SECTION */}
          <View style={styles.bottomBox}>
            <Text style={styles.machineType}>
              {t(machine.machineType)}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {machines.length === 0 ? (
        <Text style={styles.emptyText}>
          {t("no_machines")}
        </Text>
      ) : (
        machines.map(renderCard)
      )}
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 120,
    backgroundColor: "#f7f8fc",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 17,
    color: "#888",
    fontWeight: "600",
  },

  /* CARD WRAPPER */
  cardWrapper: {
    marginBottom: 22,
    borderRadius: 30,

    shadowColor: "#b388ff",

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.22,
    shadowRadius: 20,

    elevation: 10,
  },

  /* MAIN CARD */
  card: {
    borderRadius: 30,
    overflow: "hidden",
    paddingTop: 15,
    paddingBottom: 18,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",

    position: "relative",
  },

  /* BEAUTIFUL GLOW EFFECT */
  glowCircle: {
    position: "absolute",
    top: -40,
    right: -30,

    width: 140,
    height: 140,

    borderRadius: 100,

    backgroundColor: "rgba(255,255,255,0.35)",
  },

  /* IMAGE CONTAINER */
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 18,
    paddingTop: 10,
  },

  image: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
  },

  /* BOTTOM GLASS BOX */
  bottomBox: {
    marginTop: 14,

    marginHorizontal: 16,

    paddingVertical: 15,

    borderRadius: 20,

    backgroundColor: "rgba(255,255,255,0.30)",

    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.45)",

    alignItems: "center",
    justifyContent: "center",
  },

  /* MACHINE NAME */
  machineType: {
    fontSize: 18,
    fontWeight: "800",

    color: "#4b3f72",

    textTransform: "capitalize",

    letterSpacing: 0.6,
  },
});