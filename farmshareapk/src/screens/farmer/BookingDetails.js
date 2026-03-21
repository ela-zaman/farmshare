import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  ScrollView,
  Button,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useTranslation } from "react-i18next";
import { Calendar, LocaleConfig } from "react-native-calendars";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { bdLocations } from "../../data/bdLocation";

// ---------------------------------------------------------
// 1. CRITICAL: Register Locales OUTSIDE the Component
// ---------------------------------------------------------
LocaleConfig.locales["en"] = {
  monthNames: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  monthNamesShort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  dayNames: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  dayNamesShort: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
  today: "Today"
};

LocaleConfig.locales["bn"] = {
  monthNames: ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"],
  monthNamesShort: ["জানু","ফেব","মার্চ","এপ্রি","মে","জুন","জুল","আগ","সেপ্ট","অক্টো","নভে","ডিসে"],
  dayNames: ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"],
  dayNamesShort: ["রবি","সোম","মঙ্গল","বুধ","বৃহ","শুক্র","শনি"],
  today: "আজ"
};

export default function BookingDetails({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { machine } = route.params || {};
  const auth = getAuth();
  const user = auth.currentUser;

  const [bookedDates, setBookedDates] = useState({});
  const [selectedDates, setSelectedDates] = useState({});
  const [userInfo, setUserInfo] = useState(null);
  const [tillageAmount, setTillageAmount] = useState("");
  const [loading, setLoading] = useState(true);

  const isBn = i18n.language === "bn";

  // 2. Point to the correct locale when language changes
  useEffect(() => {
    LocaleConfig.defaultLocale = isBn ? "bn" : "en";
  }, [isBn]);

  // 3. Fetch Data
  useEffect(() => {
    const loadScreenData = async () => {
      setLoading(true);
      await Promise.all([fetchUserInfo(), fetchBookedDates()]);
      setLoading(false);
    };
    loadScreenData();
  }, [machine?.id]);

  const fetchUserInfo = async () => {
    if (!user) return;
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserInfo(snap.data());
    } catch (err) { console.log("User Fetch Err:", err); }
  };

  const fetchBookedDates = async () => {
    if (!machine?.id) return;
    try {
      const q = query(
        collection(db, "bookings"),
        where("machineId", "==", machine.id),
        where("status", "==", "accepted")
      );
      const snap = await getDocs(q);
      let booked = {};
      snap.forEach((d) => {
        const datesArray = d.data()?.dates || [];
        datesArray.forEach((date) => {
          if (date) {
            booked[date] = {
              disableTouchEvent: true,
              customStyles: {
                container: { backgroundColor: "#ff4d4d", borderRadius: 20 },
                text: { color: "white", fontWeight: "bold" }
              }
            };
          }
        });
      });
      setBookedDates(booked);
    } catch (err) { console.error("Booked Dates Err:", err); }
  };

  // Safe Number Converter
  const toBanglaNumber = (num) => {
    if (num === undefined || num === null) return "";
    const bnArr = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => bnArr[d] || d).join("");
  };

  const handleDayPress = (day) => {
    if (!day?.dateString || bookedDates[day.dateString]) return;
    setSelectedDates(prev => {
      const updated = { ...prev };
      if (updated[day.dateString]) delete updated[day.dateString];
      else updated[day.dateString] = {
        customStyles: {
          container: { backgroundColor: "#007bff", borderRadius: 20 },
          text: { color: "white", fontWeight: "bold" }
        }
      };
      return updated;
    });
  };

  const handleBooking = async () => {
    if (!user) { Alert.alert(t("error"), t("login_required")); return; }
    if (!tillageAmount) { Alert.alert(t("error"), t("fill_all_fields")); return; }
    const dates = Object.keys(selectedDates);
    if (dates.length === 0) { Alert.alert(t("error"), t("select_dates")); return; }

    try {
      await addDoc(collection(db, "bookings"), {
        machineId: machine.id,
        providerId: machine.providerId,
        machineType: machine.machineType,
        userId: user.uid,
        userName: userInfo?.name || "User",
        userPhone: userInfo?.phone || "",
        tillageAmount,
        dates,
        status: "pending",
        createdAt: new Date()
      });
      Alert.alert(t("success"), t("booking_sent"));
      navigation.goBack();
    } catch (err) { Alert.alert(t("error"), t("booking_failed")); }
  };

  const getDistrictLabel = (key) => (key && bdLocations[key]) ? (isBn ? bdLocations[key].bn : key) : (key || "");

  const getUpazilaLabel = (dKey, upKey) => {
    if (!dKey || !upKey || !bdLocations[dKey]) return upKey || "";
    const found = bdLocations[dKey].upazilas?.find(u => u.en?.toLowerCase() === upKey.toLowerCase());
    return isBn ? (found?.bn || upKey) : (found?.en || upKey);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#007bff" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.info}>
          <Text style={styles.title}>{machine?.machineType || ""}</Text>
          <Text>{t("provider")}: {machine?.providerName || ""}</Text>
          <Text>{t("location")}: {getUpazilaLabel(machine?.district, machine?.upazilla)}, {getDistrictLabel(machine?.district)}</Text>
          <Text style={styles.price}>{t("charge")}: {machine?.tillageCharge || ""} ({machine?.tillageType || ""})</Text>
        </View>
      </View>

      <Text style={styles.label}>{t("tillage_number")}</Text>
      <TextInput
        style={styles.input}
        value={tillageAmount}
        onChangeText={setTillageAmount}
        keyboardType="numeric"
        placeholder={t("enter_amount")}
      />

      <Calendar
        // 4. CRITICAL: Unique Key forces re-mount on language change
        key={i18n.language} 
        minDate={new Date().toISOString().split("T")[0]}
        markingType="custom"
        markedDates={{ ...(bookedDates || {}), ...(selectedDates || {}) }}
        dayComponent={({ date, state, marking }) => {
          if (!date) return null;
          const styles_m = marking?.customStyles || {};
          return (
            <TouchableOpacity
              style={[styles.dayContainer, styles_m.container || {}]}
              onPress={() => handleDayPress(date)}
              disabled={!!bookedDates[date.dateString]}
            >
              <Text style={{ 
                color: styles_m.text?.color || (state === "disabled" ? "#ccc" : "#000"),
                fontWeight: styles_m.text?.fontWeight || "normal"
              }}>
                {isBn ? toBanglaNumber(date.day) : date.day}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.btnContainer}>
        <Button title={t("book_now")} onPress={handleBooking} color="#007bff" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#f8fbff", padding: 15, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: "#e1efff" },
  title: { fontSize: 22, fontWeight: "bold", color: "#003366", marginBottom: 5 },
  price: { fontSize: 16, fontWeight: "600", color: "#28a745", marginTop: 5 },
  label: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 20, backgroundColor: "#fafafa" },
  dayContainer: { width: 35, height: 35, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  btnContainer: { marginTop: 25, marginBottom: 50 }
});