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
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { bdLocations } from "../../data/bdLocation";
import { useNavigation } from "@react-navigation/native";

export default function SearchResult({ route }) {
  const { t, i18n } = useTranslation();
  const { machineType, district, upazilla } = route.params || {};
  const navigation = useNavigation();

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  const isBn = i18n.language === "bn";

  // ✅ SAFE normalize (FIXED BUG)
  const normalize = (text) => {
    if (!text) return "";
    return text.toString().trim().toLowerCase();
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      let q = collection(db, "machines");
      const conditions = [];

      if (machineType) {
        conditions.push(where("machineType", "==", machineType));
      }

      if (district) {
        conditions.push(where("district", "==", district));
      }

      if (upazilla) {
        conditions.push(where("upazilla", "==", upazilla));
      }

      if (conditions.length > 0) {
        q = query(q, ...conditions);
      }

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setMachines(data);
    } catch (error) {
      console.log("ERROR FETCHING MACHINES:", error);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Helpers
  // ------------------------------

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
    return isBn
      ? bdLocations[districtKey]?.bn || districtKey
      : districtKey;
  };

  const getUpazillaLabel = (districtKey, upazilaEn) => {
    if (!districtKey || !upazilaEn) return "";

    const districtData = bdLocations[districtKey];

    const upazilaObj = districtData?.upazilas?.find(
      (u) => normalize(u?.en) === normalize(upazilaEn)
    );

    if (!upazilaObj) return upazilaEn;

    return isBn ? upazilaObj.bn : upazilaObj.en;
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

  const getMachineTypeLabel = (value) => {
    if (!value) return "";
    const key = MACHINE_TYPE_MAP[value?.toLowerCase?.()];
    return key ? t(key) : value;
  };

  // ✅ TAKA FORMAT
  const formatTaka = (amount) => {
    if (!amount) return isBn ? "০ টাকা" : "0 Taka";

    return isBn
      ? `${amount} টাকা`
      : `${amount} Taka`;
  };

  // ------------------------------
  // UI
  // ------------------------------

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("BookingDetails", { machine: item })}
    >
      <Image
        source={getMachineImage(item.machineType)}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={styles.title}>
          {getMachineTypeLabel(item.machineType)}
        </Text>

        <Text style={styles.text}>
          {t("provider")}: {item.providerName || "Unknown"}
        </Text>

        <Text style={styles.text}>
          {t("phone")}: {item.phone || "N/A"}
        </Text>

        <Text style={styles.text}>
          {t("district")}: {getDistrictLabel(item.district)}
        </Text>

        <Text style={styles.text}>
          {t("upazilla")}: {getUpazillaLabel(item.district, item.upazilla)}
        </Text>

        <Text style={styles.text}>
          {t("village")}: {item.village || ""}
        </Text>

        {/* ✅ NEW MULTILINGUAL CHARGES */}
        <Text style={styles.text}>
          {t("charge_per_decimal")}: {formatTaka(item.chargePerDecimal)}
        </Text>

        <Text style={styles.text}>
          {t("charge_per_bigha")}: {formatTaka(item.chargePerBigha)}
        </Text>
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

// ------------------------------
// Styles
// ------------------------------

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