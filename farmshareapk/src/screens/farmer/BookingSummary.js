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
import { db } from "../../firebase/firebaseConfig";

// ---------------- BookingSummary Component ----------------
export default function BookingSummary({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  const {
    machine,
    userInfo,
    selectedDate,
    selectedSlots,
    slots, // pass full slots array from BookingDetails
    tillageAmount,
    landSize,
    landAddress,
    chargeType
  } = route.params;

  const [totalCharge, setTotalCharge] = useState(0);
  const [chargePerDecimal, setChargePerDecimal] = useState(0);
  const [chargePerBigha, setChargePerBigha] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [slotLabels, setSlotLabels] = useState([]);

  // Convert number to Bangla
  const toBanglaNumber = (num) => {
    const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => bn[d] || d).join("");
  };

  const getSlotLabel = (slot) => {
    const labelsBn = { morning:"সকাল", noon:"দুপুর", afternoon:"বিকাল", evening:"সন্ধ্যা" };
    const labelText = isBn ? labelsBn[slot.label] : slot.label;
    const formatHour = (h) => {
      let hour = h % 12; if(hour===0) hour=12;
      return isBn ? toBanglaNumber(hour) : hour;
    };
    return `${labelText} ${formatHour(slot.start)}.00 - ${formatHour(slot.end)}.00 ${isBn?"টা":""}`;
  };

  useEffect(() => {
    const loadCharges = async () => {
      if (!machine?.id) return;

      // Fetch latest charges from Firebase
      const snap = await getDoc(doc(db, "machines", machine.id));
      if (snap.exists()) {
        const data = snap.data();
        const perDecimal = data?.chargePerDecimal || 0;
        const perBigha = data?.chargePerBigha || 0;
        setChargePerDecimal(perDecimal);
        setChargePerBigha(perBigha);

        let total = 0;
        if (chargeType === "per_decimal") {
          total = perDecimal * landSize * tillageAmount;
        } else {
          total = perBigha * landSize * tillageAmount;
        }
        setTotalCharge(total);

        // Get human-readable slot labels
        const labels = selectedSlots.map(id => {
          const slot = slots.find(s => s.id === id);
          return slot ? getSlotLabel(slot) : id;
        });
        setSlotLabels(labels);

        // Calculate total hours
        const hours = selectedSlots.reduce((sum, id) => {
          const slot = slots.find(s => s.id === id);
          return slot ? sum + (slot.end - slot.start) : sum;
        }, 0);
        setTotalHours(hours);
      }
    };

    loadCharges();
  }, []);

  const handleConfirmBooking = async () => {
    try {
      await addDoc(collection(db, "bookings"), {
        machineId: machine.id,
        providerId: machine.providerId,
        machineType: machine.machineType,
        userId: userInfo.uid,
        userName: userInfo.name,
        userPhone: userInfo.phone,
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
        address:userInfo.address
      });

      Alert.alert(t("success"), t("booking_sent"));
      navigation.popToTop();
    } catch (err) {
      console.error(err);
      Alert.alert(t("error"), t("booking_failed"));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom:50}}>
      <Text style={styles.title}>{isBn ? t(machine?.machineType) : machine?.machineType}</Text>
      <Text style={styles.label}>{t("provider")}: {machine?.providerName}</Text>
      <Text style={styles.label}>{t("district")}: {machine?.district}</Text>
      <Text style={styles.label}>{t("upazilla")}: {machine?.upazilla}</Text>
      <Text style={styles.label}>{t("village")}: {machine?.village}</Text>
      <Text style={styles.label}>{t("phone")}: {machine?.phone}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("booking_details")}</Text>
        <Text>{t("selected_date")}: {isBn ? toBanglaNumber(selectedDate) : selectedDate}</Text>

        <Text>{t("selected_slots")}:</Text>
        {slotLabels.map((label, idx) => (
          <Text key={idx}>- {label}</Text>
        ))}

        <Text>{t("total_time")}: {isBn ? toBanglaNumber(totalHours) : totalHours} {t("hours")}</Text>
        <Text>{t("land_size")}: {isBn ? toBanglaNumber(landSize) : landSize}</Text>
        <Text>{t("land_address")}: {landAddress}</Text>
        <Text>{t("tillage_number")}: {isBn ? toBanglaNumber(tillageAmount) : tillageAmount}</Text>
        <Text>{t("charge_type")}: {chargeType === "per_decimal" ? t("per_decimal") : t("per_bigha")}</Text>
        <Text style={styles.total}>
          {t("total_charge")}: {isBn ? toBanglaNumber(totalCharge) : totalCharge}
        </Text>
      </View>

      <View style={styles.btnContainer}>
        <Button title={t("confirm_booking")} onPress={handleConfirmBooking} color="#007bff"/>
      </View>
    </ScrollView>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container:{flex:1,padding:15,backgroundColor:"#fff"},
  title:{fontSize:22,fontWeight:"bold",marginBottom:10,color:"#003366"},
  label:{fontSize:16,marginBottom:5},
  section:{marginTop:20,padding:15,backgroundColor:"#f2f8ff",borderRadius:10},
  sectionTitle:{fontSize:18,fontWeight:"bold",marginBottom:10},
  total:{fontSize:18,fontWeight:"bold",marginTop:10},
  btnContainer:{marginTop:25}
});