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

  const isBn = i18n.language === "bn";

  const normalize = (text) => {
    if (!text) return "";
    return text.toString().trim().toLowerCase();
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (userSnap.exists()) {
        const data = userSnap.data();
        fetchMachines(data.district, data.upazila);
      }
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  const fetchMachines = async (district, upazila) => {
    try {
      let data = [];

      let q1 = query(
        collection(db, "machines"),
        where("machineType", "==", machineType),
        where("district", "==", district),
        where("upazila", "==", upazila)
      );

      let snap = await getDocs(q1);
      data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (data.length === 0) {
        let q2 = query(
          collection(db, "machines"),
          where("machineType", "==", machineType),
          where("district", "==", district)
        );

        snap = await getDocs(q2);
        data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

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

  // ✅ NEW: Smart image selector
  const getMachineImage = (item) => {
    // 🔥 Firebase uploaded image (most important)
    if (item?.imageUrl) return { uri: item.imageUrl };
    if (item?.image) return { uri: item.image };
    if (item?.photo) return { uri: item.photo };
    if (item?.machineImage) return { uri: item.machineImage };

    // fallback local image
    return require("../../../assets/images/add.png");
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
      {/* ✅ MACHINE IMAGE FROM PROVIDER */}
      <Image source={getMachineImage(item)} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.title}>
          {t(item.machineType)}
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
      data={machines || []}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={<Text>{t("no_data")}</Text>}
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
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#ddd"
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