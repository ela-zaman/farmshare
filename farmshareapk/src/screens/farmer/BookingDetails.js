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
  ActivityIndicator,
  Modal,
  FlatList
} from "react-native";
import { useTranslation } from "react-i18next";
import { Calendar, LocaleConfig } from "react-native-calendars";
import {
  collection,
  getDoc,
  getDocs,
  query,
  where,
  doc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { bdLocations } from "../../data/bdLocation";
import { Picker } from "@react-native-picker/picker";

// ------------------ Locale Config ------------------
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

// ------------------ Machine Images ------------------
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

// ------------------ Time Slots ------------------
const generateSlots = () => {
  const slots = [];
  for (let i = 5; i < 22; i++) {
    let label = "";
    if (i >= 5 && i < 12) label = "morning";
    else if (i >= 12 && i < 15) label = "noon";
    else if (i >= 15 && i < 18) label = "afternoon";
    else label = "evening";
    slots.push({
      id: `${i}-${i+1}`,
      start: i,
      end: i+1,
      label,
      text: `${i}:00 - ${i+1}:00`
    });
  }
  return slots;
};
// ------------------ Tillage Time Component ------------------
const TillageTimeCalculator = ({
  tillageAmount,
  landSize,
  selectedChargeType,
  isBn,
  toBanglaNumber,
  t
}) => {
  const tillage = parseFloat(tillageAmount);
  const land = parseFloat(landSize);

  if (!tillage || !land) return null;

  let totalMinutes = 0;

  if (selectedChargeType === "per_bigha") {
    // 1 hour per bigha
    totalMinutes = tillage * land * 60;
  }
  else if (selectedChargeType === "per_decimal"){
 totalMinutes = tillage * land * 2;
  
  } else {
    // 2 minutes per decimal
    totalMinutes =60;
  }

  // Convert to hours
  let totalHours = totalMinutes / 60;

  // Minimum 1 hour
  if (totalHours < 1) totalHours = 1;

  // Slots (1 slot = 1 hour)
  const totalSlots = Math.ceil(totalHours);

  return (
    <View style={{
      backgroundColor: "#e6f7ff",
      padding: 15,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#b3e0ff"
    }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>
        {t("total_tillage_time")}
      </Text>

      <Text>
        {t("total_time")}:{" "}
        {isBn ? toBanglaNumber(totalHours.toFixed(2)) : totalHours.toFixed(2)} {t("hour")}
      </Text>

      <Text>
        {t("required_slots")}:{" "}
        {isBn ? toBanglaNumber(totalSlots) : totalSlots}
      </Text>
    </View>
  );
};
// ------------------ BookingDetails Component ------------------
export default function BookingDetails({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { machine } = route.params || {};
  const auth = getAuth();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [bookedDates, setBookedDates] = useState({});
  const [bookedSlotsPerDate, setBookedSlotsPerDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [slots] = useState(generateSlots());
  const [tillageAmount, setTillageAmount] = useState("");
  const [landSize, setLandSize] = useState("");
  const [landAddress, setLandAddress] = useState("");
  const [selectedChargeType, setSelectedChargeType] = useState("per_decimal");
  const [providerImage, setProviderImage] = useState(null);// ✅

  const isBn = i18n.language === "bn";
  LocaleConfig.defaultLocale = isBn ? "bn" : "en";

   /* ---------- SAFETY CHECK ---------- */
  if (!machine || !machine.id) {
    return (
      <View style={styles.center}>
        <Text>Machine data not found</Text>
      </View>
    );
  }
  // ---------------- Fetch Data ----------------
 useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchBookings();
        await fetchProviderImage();
      } catch (e) {
        console.log("LOAD ERROR:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [machine.id]);

  const fetchUser = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) setUserInfo({ ...snap.data(), uid: user.uid });
  };
const fetchProviderImage = async () => {
  try {
    if (!machine?.providerId) {
      console.log("❌ No providerId");
      return;
    }

    const userRef = doc(db, "users", machine.providerId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("❌ User not found");
      return;
    }

    const data = userSnap.data();
    console.log("✅ User data:", data);

    const imageUrl =
  data.photo ||
  data.photoUrl?.secure_url ||
  data.photoUrl ||
  data.image ||
  null;

    console.log("✅ Image URL:", imageUrl);
    console.log("Image fields:", {
  photo: data.photo,
  image: data.image,
  photoUrl: data.photoUrl
});

    setProviderImage(imageUrl);


  } catch (err) {
    console.error("❌ Fetch error:", err);

  }
};
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

    return IMAGE_MAP[key] ;
  };
  const fetchBookings = async () => {
    if (!machine?.id) return;
    const q = query(
      collection(db, "bookings"),
      where("machineId", "==", machine.id),
      where("status", "==", "accepted")
    );
    const snap = await getDocs(q);

    const datesObj = {};
    const slotsObj = {};

    snap.forEach(doc => {
      const data = doc.data();
      const dates = data?.dates || [];
      const slotsArr = data?.slots || [];
      dates.forEach(date => {
        if (!slotsObj[date]) slotsObj[date] = [];
        slotsObj[date] = [...slotsObj[date], ...slotsArr];

        const totalSlots = slots.length;
        const bookedCount = slotsObj[date].length;

        if (bookedCount >= totalSlots) {
          datesObj[date] = {
            disabled: true,
            customStyles: {
              container: { backgroundColor: "#ff4d4d", borderRadius: 20 },
              text: { color: "white", fontWeight: "bold" }
            }
          };
        } else {
          datesObj[date] = {
            customStyles: {
              container: { backgroundColor: "#ffd700", borderRadius: 20 },
              text: { color: "black", fontWeight: "bold" }
            }
          };
        }
      });
    });

    setBookedDates(datesObj);
    setBookedSlotsPerDate(slotsObj);
  };

  // ---------------- Utils ----------------
  const toBanglaNumber = (num) => {
    const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => bn[d] || d).join("");
  };

  const getDistrictLabel = (key) => isBn ? bdLocations[key]?.bn || key : key;
  const getUpazilaLabel = (dKey, uKey) => {
    const upazilas = bdLocations[dKey]?.upazilas || [];
    const found = upazilas.find(u => u.en?.toLowerCase()===uKey?.toLowerCase());
    return isBn ? (found?.bn || uKey) : (found?.en || uKey);
  };

  const handleDayPress = (day) => {
    if (!day?.dateString || bookedDates[day.dateString]?.disabled) return;
    setSelectedDate(day.dateString);
    setSelectedSlots([]);
    setModalVisible(true);
  };

  const toggleSlot = (id) => {
    const bookedSlots = bookedSlotsPerDate[selectedDate] || [];
    if (bookedSlots.includes(id)) return;
    setSelectedSlots(selectedSlots.includes(id) ? selectedSlots.filter(s=>s!==id) : [...selectedSlots, id]);
  };

  // ---------------- Updated handleBooking ----------------
  const handleBooking = () => {
    if (!user) return Alert.alert(t("error"), t("login_required"));
    if (!tillageAmount || !landSize || !landAddress) return Alert.alert(t("error"), t("fill_all_fields"));
    if (!selectedDate || !selectedSlots.length) return Alert.alert(t("error"), t("select_time"));

    // Navigate to BookingSummary
    navigation.navigate("BookingSummary", {
      machine,
      userInfo,
      selectedDate,
      selectedSlots,
      slots,
      tillageAmount: parseFloat(tillageAmount),
      landSize: parseFloat(landSize),
      landAddress,
      chargeType: selectedChargeType
    });
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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#007bff"/></View>;

  // ---------------- Render ----------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom:200}}>
      {/* TOP CARD */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.info}>
            <Text style={styles.title}>{isBn ? t(machine?.machineType) : machine?.machineType}</Text>
            {providerImage && (
  <Image
    source={{ uri: providerImage }}
    style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      marginTop: 8
    }}
  />
)}
            <Text>{t("provider")}: {machine?.providerName}</Text>
            <Text>{t("district")}: {getDistrictLabel(machine?.district)}</Text>
            <Text>{t("upazilla")}: {getUpazilaLabel(machine?.district, machine?.upazila)}</Text>
            <Text>{t("village")}: {machine?.village}</Text>
            <Text>{t("phone")}: {machine?.phone}</Text>
            <Text>{t("charge_per_bigha")}: {isBn ? toBanglaNumber(machine?.chargePerBigha) : machine?.chargePerBigha}</Text>
            <Text>{t("charge_per_decimal")}: {isBn ? toBanglaNumber(machine?.chargePerDecimal) : machine?.chargePerDecimal}</Text>
            
           
      
          </View>
          
  <Image
  source={getMachineImage(machine?.machineType)}
  style={styles.image}
  resizeMode="contain"
/>
        </View>
      </View>

      {/* INPUTS */}
      <Text style={styles.label}>{t("tillage_number")}</Text>
      
      <TextInput style={styles.input} value={tillageAmount} onChangeText={setTillageAmount} keyboardType="numeric" placeholder={t("enter_amount") } placeholderTextColor="blue"/>
      
      <Text style={styles.label}>{t("unit_of_charge_type")}</Text>
      <View style={styles.picker}>
        <Picker selectedValue={selectedChargeType} onValueChange={setSelectedChargeType}>
          <Picker.Item label={t("per_decimal")} value="per_decimal"/>
          <Picker.Item label={t("per_bigha")} value="per_bigha"/>
          <Picker.Item label={t("per_hour")} value="per_hour"/>
          

        </Picker>
      </View>
      <Text style={styles.label}>{t("land_size")}</Text>
      <TextInput placeholderTextColor="blue" style={styles.input} value={landSize} onChangeText={setLandSize} keyboardType="numeric" placeholder={t("enter_land_size")}/>
      {/* Address */}
<Text style={styles.label}>{t("land_address")}</Text>
<TextInput
  style={styles.input}
  value={landAddress}
  onChangeText={setLandAddress}
  placeholder={t("enter_address")}
  placeholderTextColor="blue"
/>

      
      <TillageTimeCalculator
  tillageAmount={tillageAmount}
  landSize={landSize}
  selectedChargeType={selectedChargeType}
  isBn={isBn}
  toBanglaNumber={toBanglaNumber}
  t={t}
/>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>{t("select_date_and_time")}</Text>
      <Calendar
        key={i18n.language}
        minDate={new Date().toISOString().split("T")[0]}
        markingType="custom"
        markedDates={{
          ...bookedDates,
          ...(selectedDate ? {[selectedDate]: {customStyles:{container:{backgroundColor:"#007bff", borderRadius:20}, text:{color:"white", fontWeight:"bold"}}}} : {})
        }}
        onDayPress={handleDayPress}
        dayComponent={({ date, state, marking }) => {
          if (!date) return null;
          const style = marking?.customStyles || {};
          return (
            <TouchableOpacity style={[styles.dayContainer, style.container]} disabled={marking?.disabled} onPress={()=>handleDayPress(date)}>
              <Text style={{ color: style.text?.color || (state==="disabled"?"#ccc":"#000"), fontWeight: style.text?.fontWeight || "normal"}}>
                {isBn ? toBanglaNumber(date.day) : date.day}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {selectedDate && (
        <View style={{ marginTop: 10, padding: 10, backgroundColor: "#e6f0ff", borderRadius: 10 }}>
          <Text style={{ fontWeight: "bold" }}>{t("selected_date")}: {isBn ? toBanglaNumber(selectedDate) : selectedDate}</Text>
        </View>
      )}

      {selectedSlots.length>0 && <View style={{marginTop:15}}>
        <Text style={{fontWeight:"bold"}}>{t("selected_slots")}:</Text>
        {selectedSlots.map(s=><Text key={s}>{getSlotLabel(slots.find(sl=>sl.id===s))}</Text>)}
      </View>}

      <View style={styles.btnContainer}>
        <Button title={t("book_now")} onPress={handleBooking} color="#007bff"/>
      </View>

      {/* SLOT MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{flex:1,padding:20}}>
          <Text style={{fontSize:20,fontWeight:"bold"}}>{t("select_time")}</Text>
          <FlatList
            data={slots}
            keyExtractor={item=>item.id}
            renderItem={({item})=>{
              const bookedSlots = bookedSlotsPerDate[selectedDate] || [];
              const isBooked = bookedSlots.includes(item.id);
              const isSelected = selectedSlots.includes(item.id);
              return (
                <TouchableOpacity style={[styles.slot, isBooked && styles.booked, isSelected && styles.selected]} disabled={isBooked} onPress={()=>toggleSlot(item.id)}>
                  <Text style={{color: isSelected ? "white" : "black"}}>{getSlotLabel(item)}</Text>
                </TouchableOpacity>
              );
            }}
          />
          <Button title={t("confirm")} onPress={()=>setModalVisible(false)}/>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container:{flex:1,padding:15,backgroundColor:"#fff"},
  center:{flex:1,justifyContent:"center",alignItems:"center"},
  card:{backgroundColor:"#f8fbff",padding:15,borderRadius:15,marginBottom:20,borderWidth:1,borderColor:"#e1efff"},
  cardContent:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  info:{flex:1,paddingRight:10},
  title:{fontSize:22,fontWeight:"bold",color:"#003366",marginBottom:5},
  image:{width:100,height:100,borderRadius:15,backgroundColor:"#e0e0e0"},
  label:{fontWeight:"bold",fontSize:16,marginBottom:8},
  input:{borderWidth:1,borderColor:"#ccc",borderRadius:10,padding:12,marginBottom:20,backgroundColor:"#fafafa"},
  picker:{borderWidth:1,borderColor:"#ccc",borderRadius:10,marginBottom:20,backgroundColor:"#fafafa"},
  btnContainer:{marginTop:25,marginBottom:20},
  dayContainer:{width:35,height:35,alignItems:"center",justifyContent:"center",borderRadius:18},
  slot:{padding:12,marginVertical:5,borderRadius:10,backgroundColor:"#eee"},
  selected:{backgroundColor:"#007bff"},
  booked:{backgroundColor:"#ff4d4d"}
});