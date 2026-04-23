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
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { bdLocations } from "../../data/bdLocation";
import { useNavigation } from "@react-navigation/native";

export default function SearchResult({ route }) {
  const { t, i18n } = useTranslation();
  const { machineType } = route.params || {};
  const navigation = useNavigation();

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userDistrict, setUserDistrict] = useState(null);
  const [userUpazilla, setUserUpazilla] = useState(null);

  const isBn = i18n.language === "bn";

  // ---------------- SAFE NORMALIZE ----------------
  const normalize = (text) => {
    if (!text) return "";
    return text.toString().trim().toLowerCase();
  };

  // ---------------- LOAD USER + MACHINES ----------------
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 🔥 Get user location
      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserDistrict(data.district);
        setUserUpazilla(data.upazila);

        // Fetch machines AFTER getting user data
        fetchMachines(data.district, data.upazila);
      }
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  // ---------------- FETCH MACHINES ----------------
  const fetchMachines = async (district, upazila) => {
  try {
    let data = [];
    console.log("USER DISTRICT:", district);
console.log("USER UPAZILA:", upazila);

    // ✅ 1. FULL MATCH (machine + district + upazila)
    let q1 = query(
      collection(db, "machines"),
      where("machineType", "==", machineType),
      where("district", "==", district),
      where("upazila", "==", upazila)
    );

    let snap = await getDocs(q1);
    data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // ✅ 2. FALLBACK: district only
    if (data.length === 0) {
      let q2 = query(
        collection(db, "machines"),
        where("machineType", "==", machineType),
        where("district", "==", district)
      );

      snap = await getDocs(q2);
      data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // ✅ 3. FINAL FALLBACK: machineType only
    if (data.length === 0) {
      let q3 = query(
        collection(db, "machines"),
        where("machineType", "==", machineType)
      );

      snap = await getDocs(q3);
      data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    setMachines(data);

  } catch (error) {
    console.log("ERROR FETCHING MACHINES:", error);
    setMachines([]);
  } finally {
    setLoading(false);
  }
};

  // ---------------- HELPERS ----------------

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

    return isBn ? (upazilaObj?.bn || upazilaEn) : (upazilaObj?.en || upazilaEn);
  };

  const getMachineTypeLabel = (value) => {
    if (!value) return "";
    return t(value) || value;
  };

  const formatTaka = (amount) => {
    if (!amount) return isBn ? "০ টাকা" : "0 Taka";
    return isBn ? `${amount} টাকা` : `${amount} Taka`;
  };

  // ---------------- RENDER ITEM ----------------
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
          {t("upazilla")}: {getUpazillaLabel(item.district, item.upazila)}
        </Text>

        <Text style={styles.text}>
          {t("village")}: {item.village || ""}
        </Text>

        <Text style={styles.text}>
          {t("charge_per_decimal")}: {formatTaka(item.chargePerDecimal)}
        </Text>

        <Text style={styles.text}>
          {t("charge_per_bigha")}: {formatTaka(item.chargePerBigha)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>{t("loading")}</Text>
      </View>
    );
  }

  // ---------------- UI ----------------
  return (
    <FlatList
      data={machines || []}
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

// ---------------- STYLES ----------------
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