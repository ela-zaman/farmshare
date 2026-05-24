import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  ImageBackground,
  Alert,
  ScrollView,
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

export default function ProviderBookingRequests() {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState([]);

  const auth = getAuth();
  const provider = auth.currentUser;

  const isBn = i18n.language === "bn";

  /* ================= LOAD ================= */
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

  /* ================= BANGLA NUMBER ================= */
  const toBanglaNumber = (num) => {
    if (num === null || num === undefined) return "০";
    const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => bn[d] || d).join("");
  };

  /* ================= CALC ================= */
  const calculateTotalCharge = (item) => {
    const landSize = parseFloat(item.landSize) || 0;
    const tillageAmount = parseFloat(item.tillageAmount) || 0;
    const chargePerDecimal = parseFloat(item.chargePerDecimal) || 0;
    const chargePerBigha = parseFloat(item.chargePerBigha) || 0;

    return item.chargeType === "per_decimal"
      ? chargePerDecimal * landSize * tillageAmount
      : chargePerBigha * landSize * tillageAmount;
  };

  const calculateTotalHours = (item) => item.slots?.length || 0;

  const formatSlots = (slots) => {
    if (!slots?.length) return t("no_slots");

    return slots
      .map((s) => {
        const parts = s.split("-");
        const start = isBn ? toBanglaNumber(parts[0]) : parts[0];
        const end = isBn ? toBanglaNumber(parts[1]) : parts[1];
        return `${start}:00 - ${end}:00`;
      })
      .join(", ");
  };

  /* ================= MACHINE IMAGE ================= */
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

  /* ================= ACTION ================= */
  const handleDecision = async (id, decision) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: decision });

      Alert.alert(
        t("success"),
        decision === "accepted"
          ? t("booking_accepted")
          : t("booking_denied")
      );
    } catch (err) {
      console.log(err);
      Alert.alert(t("error"), t("update_failed"));
    }
  };

  /* ================= CARD ================= */
  const renderCard = (item) => {
    const totalCharge = calculateTotalCharge(item);
    const totalHours = calculateTotalHours(item);

    const formattedDates = item.dates
      ?.map((d) => (isBn ? toBanglaNumber(d) : d))
      .join(", ");

    return (
      <ImageBackground
        key={item.id}
        source={require("../../../assets/images/background6.png")}
        style={styles.card}
        imageStyle={{ borderRadius: 12 }}
      >
        <Image
          source={getMachineImage(item.machineType)}
          style={styles.image}
        />

        <Text style={styles.title}>
          {t(item.machineType)}
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.text}>
            {t("farmer_name")}: {item.userName}
          </Text>

          <Text style={styles.text}>
            {t("phone")}: {item.userPhone}
          </Text>

          <Text style={styles.text}>
            {t("address")}: {item.address}
          </Text>

          <Text style={styles.text}>
            {t("land_address")}: {item.landAddress}
          </Text>

          <Text style={styles.text}>
            {t("total_taka")}:{" "}
            {isBn
              ? toBanglaNumber(totalCharge.toFixed(2))
              : totalCharge.toFixed(2)}
          </Text>

          <Text style={styles.text}>
            {t("dates")}: {formattedDates}
          </Text>

          <Text style={styles.text}>
            {t("time_slots")}: {formatSlots(item.slots)}
          </Text>

          <Text style={styles.text}>
            {t("total_hours")}:{" "}
            {isBn ? toBanglaNumber(totalHours) : totalHours}
          </Text>

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
      </ImageBackground>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {requests.length === 0 ? (
        <View style={styles.center}>
          <Text>{t("no_requests")}</Text>
        </View>
      ) : (
        requests.map(renderCard)
      )}
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 100,
  },

  card: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
  },

  image: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "navy",
    textAlign: "center",
  },

  infoBox: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.75)",
  },

  text: {
    fontWeight: "bold",
    color: "navy",
    marginBottom: 4,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  center: {
    alignItems: "center",
    marginTop: 50,
  },
});