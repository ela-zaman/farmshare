import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  Image,
  Alert
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { bdLocations } from "../../data/bdLocation";

export default function ProviderBookingRequests() {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState([]);
  const isBn = i18n.language === "bn";

  const auth = getAuth();
  const provider = auth.currentUser;

  useEffect(() => {
    if (!provider) return;

    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", provider.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setRequests(result);
    });

    return () => unsubscribe();
  }, [provider]);

  // ---------------------------
  // Accept / Deny Booking
  // ---------------------------
  const handleDecision = async (id, decision) => {
    try {
      await updateDoc(doc(db, "bookings", id), {
        status: decision
      });

      Alert.alert(
        t("success"),
        decision === "accepted"
          ? t("booking_accepted")
          : t("booking_denied")
      );

    } catch (err) {
      console.log("Error updating booking:", err);
      Alert.alert(t("error"), t("update_failed"));
    }
  };

  // ---------------------------
  // Machine Image Mapping
  // ---------------------------
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

  // ---------------------------
  // Helper Functions
  // ---------------------------
  const toBanglaNumber = (num) => {
    if (num === undefined || num === null) return "০";
    const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => bn[d] || d).join("");
  };

  const getDistrictLabel = (district) => {
    if (!district) return t("unknown");
    const data = bdLocations[district];
    return isBn ? (data?.bn || district) : (data?.en || district);
  };

  const getUpazilaLabel = (district, upazila) => {
    if (!district || !upazila) return t("unknown");
    const upazilas = bdLocations[district]?.upazilas || [];
    const found = upazilas.find(u => u.en?.toLowerCase() === upazila?.toLowerCase());
    return isBn ? (found?.bn || upazila) : (found?.en || upazila);
  };

  const formatSlots = (slots) => {
    if (!slots?.length) return t("no_slots");
    return slots.map(s => {
      const [start, end] = s.split("-").map(Number);
      const startHr = start % 12 === 0 ? 12 : start % 12;
      const endHr = end % 12 === 0 ? 12 : end % 12;
      const periodStart = start < 12 ? t("am") : t("pm");
      const periodEnd = end <= 12 ? t("am") : t("pm");
      return `${startHr}:00${periodStart} - ${endHr}:00${periodEnd}`;
    }).join(", ");
  };

  const calculateTotalHours = (item) => {
    if (!item.slots?.length) return 0;
    return item.slots.length;
  };

  const calculateTotalCharge = (item) => {
    const landSize = Number(item.landSize || 0);
    const tillage = Number(item.tillageAmount || 0);
    const chargeType = item.chargeType;
    const perDecimal = Number(item.chargePerDecimal || 0);
    const perBigha = Number(item.chargePerBigha || 0);

    if (chargeType === "per_decimal") return landSize * tillage * perDecimal;
    if (chargeType === "per_bigha") return landSize * tillage * perBigha;
    return 0;
  };

  // ---------------------------
  // Render Card
  // ---------------------------
  const renderItem = ({ item }) => {
    const totalCharge = calculateTotalCharge(item);
    const totalHours = calculateTotalHours(item);

    return (
      <View style={styles.card}>
        <Image
          source={getMachineImage(item.machineType)}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.title}>{item.machineType || t("unknown_machine")}</Text>

          <Text>{t("farmer_name")}: {item.userName || t("unknown")}</Text>
          <Text>{t("phone")}: {item.userPhone || t("unknown")}</Text>

          <Text>{t("district")}: {getDistrictLabel(item.district)}</Text>
          <Text>{t("upazilla")}: {getUpazilaLabel(item.district, item.upazilla)}</Text>

          <Text>{t("land_size")}: {isBn ? toBanglaNumber(item.landSize || 0) : (item.landSize || 0)}</Text>
          <Text>{t("tillage_number")}: {isBn ? toBanglaNumber(item.tillageAmount || 0) : (item.tillageAmount || 0)}</Text>
          <Text>{t("charge_type")}: {item.chargeType === "per_decimal" ? t("per_decimal") : t("per_bigha")}</Text>
          <Text>{t("total_taka")}: {isBn ? toBanglaNumber(totalCharge.toFixed(2)) : totalCharge.toFixed(2)}</Text>

          <Text>{t("dates")}: {item.dates?.length ? item.dates.join(", ") : t("no_dates")}</Text>
          <Text>{t("time_slots")}: {item.slots?.length ? formatSlots(item.slots) : t("no_slots")}</Text>
          <Text>{t("total_hours")}: {isBn ? toBanglaNumber(totalHours) : totalHours}</Text>

          <View style={styles.buttonRow}>
            <Button
              title={t("accept")}
              onPress={() => handleDecision(item.id, "accepted")}
            />
            <View style={{ width: 10 }} />
            <Button
              title={t("deny")}
              color="red"
              onPress={() => handleDecision(item.id, "denied")}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>{t("no_requests")}</Text>
        </View>
      }
    />
  );
}

// ---------------------------
// Styles
// ---------------------------
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#e6f2ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginRight: 10
  },
  info: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 8
  },
  center: {
    alignItems: "center",
    marginTop: 50
  }
});