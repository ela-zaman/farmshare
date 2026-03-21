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

// ------------------ Locale Configuration ------------------
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

// ------------------ Local Machine Images ------------------
import tractorImg from "../../../assets/images/Machines/tractor.png";
import powertillerImg from "../../../assets/images/Machines/powertiller.png";
import reaperImg from "../../../assets/images/Machines/reaper.png";
import bedPlanterImg from "../../../assets/images/Machines/bed planter.png";
import combineHarvesterImg from "../../../assets/images/Machines/combine harvester.png";
import thresherImg from "../../../assets/images/Machines/thresher.png";
import sprayerImg from "../../../assets/images/Machines/sprayer.jpg";

const machineImages = {
  tractor: tractorImg,
  powertiller: powertillerImg,
  reaper: reaperImg,
  bed_planter: bedPlanterImg,
  combine_harvester: combineHarvesterImg,
  thresher: thresherImg,
  sprayer: sprayerImg
};

// ------------------ Component ------------------
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

  useEffect(() => { LocaleConfig.defaultLocale = isBn ? "bn" : "en"; }, [isBn]);

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

  // Convert numbers to Bangla
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
    const key = CHARGE_TYPE_MAP[value] || CHARGE_TYPE_MAP[value?.trim()];
    return key ? t(key) : value;
  };
  const getDistrictLabel = (key) => (key && bdLocations[key]) ? (isBn ? bdLocations[key].bn : key) : (key || "");
  const getUpazilaLabel = (dKey, upKey) => {
    if (!dKey || !upKey || !bdLocations[dKey]) return upKey || "";
    const found = bdLocations[dKey].upazilas?.find(u => u.en?.toLowerCase() === upKey.toLowerCase());
    return isBn ? (found?.bn || upKey) : (found?.en || upKey);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#007bff" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Service Provider Card */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.info}>
            <Text style={styles.title}>{getMachineTypeLabel(machine?.machineType) || ""}</Text>
            <Text>{t("provider")}: {machine?.providerName || ""}</Text>
            <Text>{t("district")}: {getDistrictLabel(machine?.district)}</Text>
            <Text>{t("upazilla")}: {getUpazilaLabel(machine?.district, machine?.upazilla)}</Text>
            <Text>{t("village")}: {machine?.village || ""}</Text>
            <Text>{t("phone")}: {machine?.phone || ""}</Text>

            {/* Tillage Charge */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5 }}>
              <Text style={[styles.price, { marginRight: 5 }]}>{t("charge")}:</Text>
              <Text style={styles.price}>
                {isBn ? toBanglaNumber(machine?.tillageCharge) : machine?.tillageCharge}
              </Text>
            </View>

            {/* Tillage Type */}
            <Text >
              {t("type")}: {getChargeTypeLabel(machine?.tillageType)}
            </Text>
          </View>

          <Image
            source={machineImages[machine?.machineType?.toLowerCase()] || require("../../../assets/images/add.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Tillage Input */}
      <Text style={styles.label}>{t("tillage_number")}</Text>
      <TextInput
        style={styles.input}
        value={tillageAmount}
        onChangeText={setTillageAmount}
        keyboardType="numeric"
        placeholder={t("enter_amount")}
      />

      {/* Calendar */}
      <Calendar
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

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#f8fbff", padding: 15, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: "#e1efff" },
  cardContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  info: { flex: 1, paddingRight: 10 },
  title: { fontSize: 22, fontWeight: "bold", color: "#003366", marginBottom: 5 },
  price: { fontSize: 16, fontWeight: "600", color: "#28a745" },
  image: { width: 100, height: 100, borderRadius: 15, backgroundColor: "#e0e0e0" },
  label: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 20, backgroundColor: "#fafafa" },
  dayContainer: { width: 35, height: 35, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  btnContainer: { marginTop: 25, marginBottom: 20 }
});