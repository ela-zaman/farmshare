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
import { MaterialIcons, FontAwesome5, Entypo } from "@expo/vector-icons";
import { bdLocations } from "../../data/bdLocation";

export default function ProviderMachineDetails() {
  const [machine, setMachine] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();

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

  /* 🔥 Image Logic */
  const getImage = (machineType) => {
    if (!machineType) return require("../../../assets/images/add.png");
    const type = machineType.toLowerCase();

    if (type === "tractor") return require("../../../assets/images/Machines/tractor.png");
    if (type === "powertiller") return require("../../../assets/images/Machines/powertiller.png");
    if (type === "reaper") return require("../../../assets/images/Machines/reaper.png");
    if (type === "sprayer") return require("../../../assets/images/Machines/sprayer.jpg");
    if (type === "thresher") return require("../../../assets/images/Machines/thresher.png");
    if (type === "combine harvester") return require("../../../assets/images/Machines/combine harvester.png");
    if (type === "bed planter") return require("../../../assets/images/Machines/bed planter.png");

    return require("../../../assets/images/add.png");
  };

  /* 🔥 Translate Machine Type */
  const getMachineTypeLabel = (type) => {
    if (!type) return "";
    const key = type.toLowerCase().replace(/\s/g, "_");
    return t(key);
  };

  /* 🔥 Translate Tillage Type */
  const getTillageTypeLabel = (type) => {
    if (!type) return "";
    const key = type.toLowerCase().replace(/\s/g, "_");
    return t(key);
  };

  if (!machine) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("loading") || "Loading..."}</Text>
      </View>
    );
  }

  /* ------------------- */
  /* District Translation */
  /* ------------------- */
  const getDistrictBn = (districtEn) => {
    return bdLocations[districtEn]?.bn || districtEn;
  };

  const getUpazillaBn = (districtEn, upazillaEn) => {
    const district = bdLocations[districtEn];
    if (!district) return upazillaEn;
    const upazilla = district.upazilas.find(u => u.en === upazillaEn);
    return upazilla ? upazilla.bn : upazillaEn;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>
      
      {/* Image */}
      <Image
        source={getImage(machine.machineType)}
        style={styles.image}
        resizeMode="contain"
      />

      {/* 🔥 Machine Name (Translated) */}
      <Text style={styles.name}>
        {getMachineTypeLabel(machine.machineType)}
      </Text>

    

      {/* 🔥 Tillage Type (Translated) */}
      <View style={styles.infoRow}>
        <FontAwesome5 name="seedling" size={20} color="#555" style={styles.icon} />
        <Text style={styles.infoText}>
          {t("type")}: {getTillageTypeLabel(machine.tillageType)}
        </Text>
      </View>

      {/* 🔥 Charge ONLY (removed charge type) */}
      <View style={styles.infoRow}>
        <MaterialIcons name="attach-money" size={20} color="#555" style={styles.icon} />
        <Text style={styles.infoText}>
          {t("charge")}: {machine.tillageCharge}
        </Text>
      </View>

      {/* Village */}
      <View style={styles.infoRow}>
        <Entypo name="home" size={20} color="#555" style={styles.icon} />
        <Text style={styles.infoText}>
          {t("village")}: {machine.village}
        </Text>
      </View>

      {/* Upazilla */}
      <View style={styles.infoRow}>
        <MaterialIcons name="location-on" size={20} color="#555" style={styles.icon} />
        <Text style={styles.infoText}>
          {t("upazila")}:{" "}
          {i18n.language === "bn"
            ? getUpazillaBn(machine.district, machine.upazilla)
            : machine.upazilla}
        </Text>
      </View>

      {/* District */}
      <View style={styles.infoRow}>
        <MaterialIcons name="location-city" size={20} color="#555" style={styles.icon} />
        <Text style={styles.infoText}>
          {t("district")}:{" "}
          {i18n.language === "bn"
            ? getDistrictBn(machine.district)
            : machine.district}
        </Text>
      </View>

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("ProviderEditMachine", { machine })
        }
      >
        <Text style={styles.buttonText}>
          {t("edit_details") || "Edit Details"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

/* --------------------------- */
/* Styles                      */
/* --------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 250,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#fff"
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },

  icon: {
    marginRight: 10,
  },

  infoText: {
    fontSize: 16,
    color: "#333"
  },

  button: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
});