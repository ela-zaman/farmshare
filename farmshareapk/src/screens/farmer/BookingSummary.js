import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Alert
} from "react-native";
import { useTranslation } from "react-i18next";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

// ---------------- BookingSummary Component ----------------
export default function BookingSummary({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  const {
    machine,
    selectedDate,
    selectedSlots = [],
    slots = [],
    tillageAmount,
    landSize,
    landAddress,
    chargeType
  } = route.params || {};

  const [userInfo, setUserInfo] = useState(null);
  const [totalCharge, setTotalCharge] = useState(0);
  const [chargePerDecimal, setChargePerDecimal] = useState(0);
  const [chargePerBigha, setChargePerBigha] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [slotLabels, setSlotLabels] = useState([]);

  const user = auth.currentUser;

  // ---------------- Number Convert ----------------
  const toBanglaNumber = (num) => {
    const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => bn[d] || d).join("");
  };

  // ---------------- Fetch User ----------------
  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.uid) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserInfo({
            uid: user.uid,
            ...snap.data()
          });
        }
      } catch (err) {
        console.log("USER FETCH ERROR:", err);
      }
    };

    fetchUser();
  }, [user]);

  // ---------------- Slot Label ----------------
  const getSlotLabel = (slot) => {
    const labelsBn = {
      morning:"সকাল",
      noon:"দুপুর",
      afternoon:"বিকাল",
      evening:"সন্ধ্যা"
    };

    const labelText = isBn ? labelsBn[slot.label] : slot.label;

    const formatHour = (h) => {
      let hour = h % 12;
      if (hour === 0) hour = 12;
      return isBn ? toBanglaNumber(hour) : hour;
    };

    return `${labelText} ${formatHour(slot.start)}.00 - ${formatHour(slot.end)}.00 ${isBn ? "টা" : ""}`;
  };

  // ---------------- Load Charges + Calculate ----------------
  useEffect(() => {
    const loadCharges = async () => {
      if (!machine?.id) return;

      try {
        const snap = await getDoc(doc(db, "machines", machine.id));

        if (snap.exists()) {
          const data = snap.data();

          const perDecimal = data?.chargePerDecimal || 0;
          const perBigha = data?.chargePerBigha || 0;

          setChargePerDecimal(perDecimal);
          setChargePerBigha(perBigha);

          // ✅ SLOT COUNT
          const slotCount = selectedSlots.length;

          let baseCharge = 0;

          if (chargeType === "per_decimal") {
            baseCharge = perDecimal * landSize * tillageAmount;
          } else {
            baseCharge = perBigha * landSize * tillageAmount;
          }

          // ✅ FINAL TOTAL
          const total = baseCharge * slotCount;
          setTotalCharge(total);

          // ✅ SLOT LABELS
          const labels = selectedSlots.map(id => {
            const slot = slots.find(s => s.id === id);
            return slot ? getSlotLabel(slot) : id;
          });
          setSlotLabels(labels);

          // ✅ TOTAL HOURS
          const hours = selectedSlots.reduce((sum, id) => {
            const slot = slots.find(s => s.id === id);
            return slot ? sum + (slot.end - slot.start) : sum;
          }, 0);

          setTotalHours(hours);
        }
      } catch (err) {
        console.log("CHARGE LOAD ERROR:", err);
      }
    };

    loadCharges();
  }, [machine, selectedSlots, slots, chargeType, landSize, tillageAmount]);

  // ---------------- Confirm Booking ----------------
  const handleConfirmBooking = async () => {
    try {
      if (!userInfo) {
        return Alert.alert(t("error"), "User info loading...");
      }

      await addDoc(collection(db, "bookings"), {
        machineId: machine.id,
        providerId: machine.providerId,

        userId: userInfo.uid,
        userName: userInfo.name || "",
        userPhone: userInfo.phone || "",
        userEmail: user?.email || "",

        tillageAmount,
        landSize,
        landAddress,
        chargeType,
        chargePerDecimal,
        chargePerBigha,
        totalCharge,

        dates: [selectedDate],
        slots: selectedSlots,

        status: "pending",
        createdAt: new Date(),

        address: userInfo.address || ""
      });

      Alert.alert(t("success"), t("booking_sent"));
      navigation.popToTop();
    } catch (err) {
      console.error(err);
      Alert.alert(t("error"), t("booking_failed"));
    }
  };

  // ---------------- UI ----------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>

      <Text style={styles.title}>
        {isBn ? t(machine?.machineType) : machine?.machineType}
      </Text>

      <Text style={styles.label}>{t("provider")}: {machine?.providerName}</Text>
      <Text style={styles.label}>{t("district")}: {machine?.district}</Text>
      <Text style={styles.label}>{t("upazilla")}: {machine?.upazilla}</Text>
      <Text style={styles.label}>{t("village")}: {machine?.village}</Text>
      <Text style={styles.label}>{t("phone")}: {machine?.phone}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("booking_details")}</Text>

        <Text>{t("selected_date")}: {selectedDate}</Text>

        <Text>{t("selected_slots")}:</Text>
        {slotLabels.map((label, idx) => (
          <Text key={idx}>- {label}</Text>
        ))}

        {/* ✅ SLOT COUNT */}
        <Text>{t("total_slots")}: {selectedSlots.length}</Text>

        <Text>{t("total_time")}: {totalHours}</Text>
        <Text>{t("land_size")}: {landSize}</Text>
        <Text>{t("land_address")}: {landAddress}</Text>
        <Text>{t("tillage_number")}: {tillageAmount}</Text>

        <Text>{t("charge_type")}: {chargeType}</Text>

        <Text style={styles.total}>
          {t("total_charge")}: {totalCharge}
        </Text>
      </View>

      <View style={styles.btnContainer}>
        <Button
          title={t("confirm_booking")}
          onPress={handleConfirmBooking}
          color="#007bff"
        />
      </View>

    </ScrollView>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#003366" },
  label: { fontSize: 16, marginBottom: 5 },
  section: { marginTop: 20, padding: 15, backgroundColor: "#f2f8ff", borderRadius: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  total: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  btnContainer: { marginTop: 25 }
});