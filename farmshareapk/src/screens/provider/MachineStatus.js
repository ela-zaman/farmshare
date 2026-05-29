// screens/provider/ProviderMachineStatus.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  Button,
  Image
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useTranslation } from "react-i18next";

// ---------------- Locale ----------------
LocaleConfig.locales["en"] = {
  monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],
  monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
  today:"Today"
};

LocaleConfig.locales["bn"] = {
  monthNames:["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"],
  monthNamesShort:["জানু","ফেব","মার্চ","এপ্রি","মে","জুন","জুল","আগ","সেপ্ট","অক্টো","নভে","ডিসে"],
  dayNames:["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"],
  dayNamesShort:["রবি","সোম","মঙ্গল","বুধ","বৃহ","শুক্র","শনি"],
  today:"আজ"
};

// ---------------- Images ----------------
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

// ---------------- Slots ----------------
const generateSlots = () => {
  const arr = [];
  for (let i = 5; i < 22; i++) {
    let label = "";

    if (i >= 5 && i < 12) label = "morning";
    else if (i >= 12 && i < 15) label = "noon";
    else if (i >= 15 && i < 18) label = "afternoon";
    else label = "evening";

    arr.push({
      id: `${i}-${i+1}`,
      start: i,
      end: i+1,
      label
    });
  }
  return arr;
};

export default function MachineStatus({ route }) {
  const { machineId, machineType } = route.params || {};
  const { t, i18n } = useTranslation();

  const isBn = i18n.language === "bn";
  LocaleConfig.defaultLocale = isBn ? "bn" : "en";

  const [loading, setLoading] = useState(true);
  const [bookedData, setBookedData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [machine, setMachine] = useState(null);

  // Fetch bookings - moved before conditional return
  useEffect(() => {
    if (!machineId) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "bookings"),
          where("machineId", "==", machineId),
          where("status", "==", "accepted")
        );

        const snap = await getDocs(q);
        const obj = {};

        snap.forEach(doc => {
          const data = doc.data();

          (data?.dates || []).forEach(date => {
            if (!obj[date]) obj[date] = [];

            (data?.slots || []).forEach(slotId => {
              obj[date].push({
                slotId,
                booking: data
              });
            });
          });
        });

        setBookedData(obj);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [machineId]);

  // Fetch machine details - moved before conditional return
  useEffect(() => {
    const fetchMachine = async () => {
      if (!machineId) return;

      try {
        const ref = doc(db, "machines", machineId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setMachine(snap.data());
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchMachine();
  }, [machineId]);

  const slots = generateSlots();

  // ---------------- Helpers ----------------
  const toBanglaNumber = (num) => {
    if (num === undefined || num === null) return "";
    const bn = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
    return num.toString().split("").map(d => bn[d] || d).join("");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);

    const day = isBn ? toBanglaNumber(date.getDate()) : date.getDate();
    const month = isBn
      ? LocaleConfig.locales.bn.monthNames[date.getMonth()]
      : LocaleConfig.locales.en.monthNames[date.getMonth()];
    const year = isBn ? toBanglaNumber(date.getFullYear()) : date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  // ✅ Enhanced multilingual number formatter for any number (not just dates)
  const formatMultilingualNumber = (num) => {
    if (num === undefined || num === null) return "";
    if (isBn) {
      return toBanglaNumber(num);
    }
    return num.toString();
  };

  const getMachineImage = () => {
    if (machine?.machineImage && machine.machineImage.trim() !== "") {
      return { uri: machine.machineImage };
    }
    return require("../../../assets/images/add.png");
  };

  const getMachineTypeLabel = (type) => {
    if (!type) return "";
    const key = type.toLowerCase().replace(/\s/g, "_");
    return t(key);
  };

  const getSlotLabel = (slot) => {
    const labelsBn = { morning:"সকাল", noon:"দুপুর", afternoon:"বিকাল", evening:"সন্ধ্যা" };
    const labelText = isBn ? labelsBn[slot.label] : t(slot.label);
    
    const formatHour = (h) => {
      let hour = h % 12;
      if (hour === 0) hour = 12;
      return formatMultilingualNumber(hour);
    };

    return `${labelText} ${formatHour(slot.start)}:00 - ${formatHour(slot.end)}:00 ${isBn ? "টা" : ""}`;
  };

  const handleSlotPress = (slot) => {
    const found = bookedData[selectedDate]?.find(b => b.slotId === slot.id);
    if (found) {
      setSelectedBooking(found.booking);
      setModalVisible(true);
    }
  };

  // ---------------- Mark Dates ----------------
  const markedDates = {};
  const today = new Date().toISOString().split("T")[0];

  Object.keys(bookedData).forEach(date => {
    const totalSlots = slots.length;
    const bookedCount = bookedData[date].length;

    if (bookedCount === totalSlots) {
      markedDates[date] = {
        customStyles: { container:{backgroundColor:"#ff4d4d",borderRadius:20}, text:{color:"white",fontWeight:"bold"} }
      };
    } else if (bookedCount > 0) {
      markedDates[date] = {
        customStyles: { container:{backgroundColor:"#ffd700",borderRadius:20}, text:{color:"black",fontWeight:"bold"} }
      };
    }
  });

  if (selectedDate) {
    markedDates[selectedDate] = {
      customStyles: { container:{backgroundColor:"#007bff",borderRadius:20}, text:{color:"white",fontWeight:"bold"} }
    };
  }

  // Conditional return after all hooks
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff"/>
      </View>
    );
  }

  return (
    <>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.machineHeader}>
              <Image source={getMachineImage()} style={styles.image} />
              <Text style={styles.machineType}>
                {t("machine_type")}: {getMachineTypeLabel(machineType)}
              </Text>
              <Text style={styles.calendarTitle}>{t("machine_calendar")}</Text>
            </View>

            <Calendar
              key={i18n.language}
              minDate={today}
              markingType="custom"
              markedDates={markedDates}
              onDayPress={(d)=>{ if(d.dateString >= today) setSelectedDate(d.dateString); }}
              dayComponent={({ date, marking }) => {
                if (!date) return null;
                const isPast = date.dateString < today;
                const style = marking?.customStyles || {};
                return (
                  <TouchableOpacity
                    disabled={isPast}
                    style={[styles.dayContainer, style.container, isPast && {backgroundColor:"#eee"}]}
                    onPress={()=>!isPast && setSelectedDate(date.dateString)}
                  >
                    <Text style={{color:isPast?"#ccc":style.text?.color||"#000", fontWeight: style.text?.fontWeight||"normal"}}>
                      {formatMultilingualNumber(date.day)}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {selectedDate && (
              <Text style={styles.subtitle}>
                {t("booked_slots_for")} {formatDate(selectedDate)}
              </Text>
            )}
          </>
        }

        data={selectedDate ? slots : []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const found = bookedData[selectedDate]?.find(b=>b.slotId===item.id);
          const isBooked = !!found;
          return (
            <TouchableOpacity style={[styles.slot, isBooked?styles.booked:styles.available]} onPress={()=>handleSlotPress(item)}>
              <Text style={{color:isBooked?"white":"black"}}>{getSlotLabel(item)}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{padding:15,paddingBottom:150}}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            {selectedBooking && (
              <>
                <Text style={styles.modalTitle}>{t("booking_info")}</Text>
                <Text>{t("farmer_name")}: {selectedBooking.userName}</Text>
                <Text>{t("phone")}: {selectedBooking.userPhone}</Text>
                <Text>{t("land_address")}: {selectedBooking.landAddress}</Text>
                <Text>{t("land_size")}: {formatMultilingualNumber(selectedBooking.landSize)} {t("bigha")}</Text>
                <Text>{t("tillage_number")}: {formatMultilingualNumber(selectedBooking.tillageAmount)}</Text>
                <Text>{t("charge_type")}: {t(selectedBooking.chargeType)}</Text>
                <Text>{t("total_charge")}: {formatMultilingualNumber(selectedBooking.totalCharge)} {t("taka")}</Text>
                <Button title={t("close")} onPress={()=>setModalVisible(false)} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  center:{flex:1,justifyContent:"center",alignItems:"center"},
  machineHeader:{alignItems:"center",marginBottom:15},
  image:{width:100,height:100,resizeMode:"contain"},
  machineType:{fontSize:16,fontWeight:"bold",marginTop:5},
  calendarTitle:{fontSize:18,fontWeight:"bold",marginTop:5},
  subtitle:{marginTop:10,fontWeight:"bold"},
  dayContainer:{width:35,height:35,justifyContent:"center",alignItems:"center",borderRadius:18},
  slot:{padding:12,marginVertical:5,borderRadius:10},
  booked:{backgroundColor:"#ff4d4d"},
  available:{backgroundColor:"#e6f0ff"},
  modalBg:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"rgba(0,0,0,0.5)"},
  modalBox:{width:"85%",backgroundColor:"#fff",padding:20,borderRadius:12},
  modalTitle:{fontSize:18,fontWeight:"bold",marginBottom:10}
});