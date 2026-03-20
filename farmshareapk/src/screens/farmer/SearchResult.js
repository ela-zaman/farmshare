import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity
} from "react-native";
import { useTranslation } from "react-i18next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { bdLocations } from "../../data/bdLocation";
import { useNavigation } from "@react-navigation/native"; // <-- import navigation hook

export default function SearchResult({ route }) {
  const { t, i18n } = useTranslation();
  const { machineType, district, upazilla } = route.params || {};
  const navigation = useNavigation(); // <-- initialize navigation

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalize = (text) => text?.toString().trim().toLowerCase();

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const snapshot = await getDocs(collection(db, "machines"));
      const allData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const filtered = allData.filter(
        (item) =>
          (!machineType || normalize(item.machineType) === normalize(machineType)) &&
          (!district || normalize(item.district) === normalize(district)) &&
          (!upazilla || normalize(item.upazilla) === normalize(upazilla))
      );

      setMachines(filtered);
    } catch (error) {
      console.log("ERROR FETCHING MACHINES:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMachineImage = (type) => {
    if (!type) return require("../../../assets/images/add.png");
    const key = type.toLowerCase().trim().replace(/\s/g, "_");
    const IMAGE_MAP = {
      tractor: require("../../../assets/images/Machines/tractor.png"),
      powertiller: require("../../../assets/images/Machines/powertiller.png"),
      reaper: require("../../../assets/images/Machines/reaper.png"),
      bed_planter: require("../../../assets/images/Machines/bed planter.png"),
      combine_harvester: require("../../../assets/images/Machines/combine harvester.png"),
      thresher: require("../../../assets/images/Machines/thresher.png"),
      sprayer: require("../../../assets/images/Machines/sprayer.jpg")
    };
    return IMAGE_MAP[key] || require("../../../assets/images/add.png");
  };

  const getDistrictLabel = (districtKey) => {
    if (!districtKey) return "";
    return i18n.language === "bn"
      ? bdLocations[districtKey]?.bn || districtKey
      : districtKey;
  };

  const getUpazillaLabel = (districtKey, upazillaEn) => {
    if (!districtKey || !upazillaEn) return "";
    const districtData = bdLocations[districtKey];
    const upazilaObj = districtData?.upazilas.find((u) => u.en === upazillaEn);
    if (!upazilaObj) return upazillaEn;
    return i18n.language === "bn" ? upazilaObj.bn : upazilaObj.en;
  };

  const getVillageLabel = (village) => {
    if (!village) return "";
    return village;
  };

  const MACHINE_TYPE_MAP = {
    tractor: "tractor",
    powertiller: "powertiller",
    reaper: "reaper",
    bed_planter: "bed_planter",
    combine_harvester: "combine_harvester",
    thresher: "thresher",
    sprayer: "sprayer"
  };

  const CHARGE_TYPE_MAP = {
    "Per Decimal": "per_decimal",
    "Per Bigha": "per_bigha"
  };

  const getMachineTypeLabel = (value) => {
    if (!value) return "";
    const key = MACHINE_TYPE_MAP[value.toLowerCase()];
    return key ? t(key) : value;
  };

  const getChargeTypeLabel = (value) => {
    if (!value) return "";
    const key = CHARGE_TYPE_MAP[value] || CHARGE_TYPE_MAP[value.trim()];
    return key ? t(key) : value;
  };

  // ------------------------------
  // Render item horizontally
  // ------------------------------
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("BookingDetails", { machine: item })} // <-- navigate with data
    >
      {/* Left: Image */}
      <Image
        source={getMachineImage(item.machineType)}
        style={styles.image}
      />

      {/* Right: Texts stacked vertically */}
      <View style={styles.info}>
        <Text style={styles.title}>{getMachineTypeLabel(item.machineType)}</Text>
        <Text style={styles.text}>{t("provider")}: {item.providerName || "Unknown"}</Text>
        <Text style={styles.text}>{t("phone")}: {item.phone || "N/A"}</Text>
        <Text style={styles.text}>{t("district")}: {getDistrictLabel(item.district)}</Text>
        <Text style={styles.text}>{t("upazila")}: {getUpazillaLabel(item.district, item.upazilla)}</Text>
        <Text style={styles.text}>{t("village")}: {getVillageLabel(item.village)}</Text>
        <Text style={styles.text}>{t("charge")}: {item.tillageCharge}</Text>
        <Text style={styles.text}>{t("type")}: {getChargeTypeLabel(item.tillageType)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={machines}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>{t("no_data")}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e6f2ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginRight: 12
  },
  info: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4
  },
  text: {
    fontSize: 14,
    marginBottom: 2
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50
  }
});