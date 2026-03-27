import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  Image,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { bdLocations } from "../../data/bdLocation";

export default function ProviderBookingRequests() {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState([]);

  const auth = getAuth();
  const provider = auth.currentUser;

  const isBn = i18n.language === "bn";

  // ---------------- Utils ----------------
  const toBanglaNumber = (num) => {
    if (num === null || num === undefined) return "০";
    const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => bn[d] || d).join("");
  };

  const getDistrictLabel = (key) => isBn ? bdLocations[key]?.bn || key : key;
  const getUpazilaLabel = (dKey, uKey) => {
    const upazilas = bdLocations[dKey]?.upazilas || [];
    const found = upazilas.find(u => u.en?.toLowerCase()===uKey?.toLowerCase());
    return isBn ? (found?.bn || uKey) : (found?.en || uKey);
  };

  const calculateTotalCharge = (item) => {
    const landSize = parseFloat(item.landSize) || 0;
    const tillageAmount = parseFloat(item.tillageAmount) || 0;
    const chargePerDecimal = parseFloat(item.chargePerDecimal) || 0;
    const chargePerBigha = parseFloat(item.chargePerBigha) || 0;

    if (item.chargeType === "per_decimal") {
      return chargePerDecimal * landSize * tillageAmount;
    } else {
      return chargePerBigha * landSize * tillageAmount;
    }
  };

  const calculateTotalHours = (item) => {
    return item.slots?.length || 0;
  };

  const formatSlots = (slots) => {
    if (!slots || !slots.length) return t("no_slots");
    return slots.map(s => `${s.split("-")[0]}:00 - ${s.split("-")[1]}:00`).join(", ");
  };

  // ---------------- Fetch Bookings ----------------
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

  // ---------------- Accept / Deny Booking ----------------
  const handleDecision = async (id, decision) => {
    try {
      await updateDoc(doc(db, "bookings", id), {
        status: decision,
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

  // ---------------- Machine Images ----------------
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
      sprayer: require("../../../assets/images/Machines/sprayer.jpg"),
    };
    return IMAGE_MAP[key] || require("../../../assets/images/add.png");
  };

  // ---------------- Render Each Booking ----------------
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
          <Text style={styles.title}>{item.machineType}</Text>

          <Text>{t("farmer_name")}: {item.userName}</Text>
          <Text>{t("phone")}: {item.userPhone}</Text>
          <Text>{t("address")}: {item.address}</Text>
          
          <Text>{t("land_size")}: {isBn ? toBanglaNumber(item.landSize) : item.landSize}</Text>
          <Text>{t("tillage_number")}: {isBn ? toBanglaNumber(item.tillageAmount) : item.tillageAmount}</Text>
          <Text>{t("charge_type")}: {item.chargeType === "per_decimal" ? t("per_decimal") : t("per_bigha")}</Text>
          <Text>{t("total_taka")}: {isBn ? toBanglaNumber(totalCharge.toFixed(2)) : totalCharge.toFixed(2)}</Text>
          <Text>{t("dates")}: {item.dates?.join(", ")}</Text>
          <Text>{t("time_slots")}: {formatSlots(item.slots)}</Text>
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

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#e6f2ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  center: {
    alignItems: "center",
    marginTop: 50,
  },
});