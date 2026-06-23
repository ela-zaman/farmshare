import React, { useEffect, useState, useRef } from "react";
import {
View,
Text,
FlatList,
StyleSheet,
Image,
TouchableOpacity,
Modal,
Alert,
ScrollView,
} from "react-native";

import { useTranslation } from "react-i18next";
import {
collection,
query,
where,
onSnapshot,
doc,
getDoc,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";

/* ================= MULTILINGUAL ================= */

const BN_DIGITS = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

const toBn = (v = "") =>
String(v).split("").map(c => BN_DIGITS[c] ?? c).join("");

const formatText = (v, lang) =>
lang === "bn" ? toBn(v) : String(v ?? "");

/* ================= DATE ================= */

const BN_MONTHS = [
"জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
"জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"
];

const formatDate = (dateStr, lang) => {
if (!dateStr) return "";

const d = new Date(dateStr);
const day = d.getDate();
const monthName =
lang === "bn"
? BN_MONTHS[d.getMonth()]
: d.toLocaleDateString("en-GB", { month: "long" });

const raw = `${day} ${monthName} ${d.getFullYear()}`;
return lang === "bn" ? toBn(raw) : raw;
};

/* ================= SLOT FORMAT ================= */

const getSlotLabel = (slot, lang, t) => {
  if (!slot) return "";

  const [start, end] = String(slot)
    .split("-")
    .map(Number);

  const isBn = lang === "bn";

  const periods = {
    morning: t("morning"),
    noon: t("noon"),
    afternoon: t("afternoon"),
    evening: t("evening"),
  };

  let period = periods.morning;

  if (start >= 12 && start < 15)
    period = periods.noon;
  else if (start >= 15 && start < 18)
    period = periods.afternoon;
  else if (start >= 18)
    period = periods.evening;

  const formatHour = (h) => {
    const value = h % 12 === 0 ? 12 : h % 12;
    return isBn ? toBn(value) : value;
  };

  return `${period} ${formatHour(start)} - ${formatHour(end)}`;
};

/* ================= MACHINE IMAGE ================= */

const getMachineImage = (machine) => {
const type = (machine?.machineType || "").toLowerCase();

if (machine?.machineImage) return { uri: machine.machineImage };

if (type === "tractor")
return require("../../../assets/images/Machines/tractor.png");

if (type === "powertiller")
return require("../../../assets/images/Machines/powertiller.png");

if (type === "reaper")
return require("../../../assets/images/Machines/reaper.png");

if (type === "sprayer")
return require("../../../assets/images/Machines/sprayer.jpg");

if (type === "thresher")
return require("../../../assets/images/Machines/thresher.png");

if (type === "combine harvester")
return require("../../../assets/images/Machines/combine harvester.png");

return require("../../../assets/images/Machines/bed planter.png");
};

export default function FarmerNotifications() {
const { t, i18n } = useTranslation();
const user = getAuth().currentUser;

const [notifications, setNotifications] = useState([]);
const [selected, setSelected] = useState(null);
const [visible, setVisible] = useState(false);

const prevCount = useRef(0);

/* ================= REALTIME ================= */

useEffect(() => {
if (!user) return;

const q = query(
collection(db, "bookings"),
where("userId", "==", user.uid),
where("status", "in", ["accepted", "denied"])
);

const unsub = onSnapshot(q, async (snap) => {
const list = await Promise.all(
snap.docs.map(async (d) => {
const booking = { id: d.id, ...d.data() };

let machine = {};
let provider = {};

if (booking.machineId) {
const m = await getDoc(doc(db, "machines", booking.machineId));
if (m.exists()) machine = m.data();
}

if (booking.providerId) {
const p = await getDoc(doc(db, "users", booking.providerId));
if (p.exists()) provider = p.data();
}

return { ...booking, machine, provider };
})
);

if (list.length > prevCount.current) {
Alert.alert(t("notification"), t("new_booking_update"));
}

prevCount.current = list.length;
setNotifications(list);
});

return () => unsub();
}, [user]);

/* ================= CARD ================= */

const renderItem = ({ item }) => (
<TouchableOpacity
style={[
styles.card,
item.status === "accepted" ? styles.accepted : styles.denied
]}
onPress={() => {
setSelected(item);
setVisible(true);
}}
>

<View style={styles.cardImageWrap}>
<Image source={getMachineImage(item.machine)} style={styles.machineImg} />

<Image
source={
item?.provider?.photo
? { uri: item.provider.photo }
: require("../../../assets/images/user.jpg")
}
style={styles.providerImg}
/>
</View>

<View style={styles.cardContent}>
<Text style={styles.title}>
{t("machine_type")}: {formatText(item.machine?.machineType, i18n.language)}
</Text>

<Text style={styles.text}>
{t("provider_name")}: {formatText(item.provider?.name, i18n.language)}
</Text>

<Text style={styles.text}>
{t("phone")}: {formatText(item.provider?.phone, i18n.language)}
</Text>

<Text style={styles.text}>
{t("status")}: {t(item.status)}
</Text>
</View>
</TouchableOpacity>
);

return (
<View style={{ flex: 1 }}>
<FlatList
data={notifications}
keyExtractor={(i) => i.id}
renderItem={renderItem}
contentContainerStyle={{ padding: 15 }}
/>

{/* ================= MODAL ================= */}
{/* ================= MODAL ================= */}

{/* ================= MODAL ================= */}

<Modal visible={visible} animationType="slide" transparent>
  <View style={styles.modalBg}>
    <View style={styles.modalBox}>
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.modalScroll}
  >

      {selected && (
        <>

          {/* IMAGE */}
          <View style={styles.imageContainer}>

            <Image
              source={getMachineImage(selected.machine)}
              style={styles.modalImage}
            />

            {/* PROVIDER IMAGE */}
            <Image
              source={
                selected?.provider?.photo
                  ? { uri: selected.provider.photo }
                  : require("../../../assets/images/user.jpg")
              }
              style={styles.providerImage}
            />

          </View>

          <Text style={styles.modalTitle}>
            {t("booking_details")}
          </Text>

          <Text style={styles.modalText}>
            {t("farmer_name")}:{" "}
            {formatText(selected.userName, i18n.language)}
          </Text>

          <Text style={styles.modalText}>
            {t("provider_name")}:{" "}
            {formatText(selected.provider?.name, i18n.language)}
          </Text>

          <Text style={styles.modalText}>
            {t("phone")}:{" "}
            {formatText(selected.provider?.phone, i18n.language)}
          </Text>

          <Text style={styles.modalText}>
            {t("date")}:{" "}
            {formatDate(selected?.dates?.[0], i18n.language)}
          </Text>

          {/* TIMESLOT */}<Text style={styles.slotHeader}>
  {t("time_slots")}
</Text>

<View style={styles.slotContainer}>
  {selected?.slots?.map((slot, index) => (
    <LinearGradient
      key={index}
      colors={["#4f8cff", "#ff4fa0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.slotBorder}
    >
      <View style={styles.slotInner}>
        <Text style={styles.slotText}>
          {getSlotLabel(
            slot,
            i18n.language,
            t
          )}
        </Text>
      </View>
    </LinearGradient>
  ))}
</View>

        

            

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setVisible(false)}
          >
            <Text style={{ color: "#fff" }}>
              {t("close")}
            </Text>
          </TouchableOpacity>

        </>
      )}

      </ScrollView>
</View>
</View>
</Modal>
</View>
);
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

card: {
flexDirection: "row",
padding: 14,
borderRadius: 16,
marginBottom: 12,
},

accepted: { backgroundColor: "#E8FFF1" },
denied: { backgroundColor: "#FFE8E8" },

cardImageWrap: {
width: 90,
height: 90,
position: "relative",
marginRight: 12,
},

machineImg: {
width: 80,
height: 80,
borderRadius: 12,
},

providerImg: {
width: 32,
height: 32,
borderRadius: 16,
position: "absolute",
bottom: 0,
right: 0,
borderWidth: 2,
borderColor: "#fff",
},

cardContent: {
flex: 1,
},

title: { fontWeight: "700", marginBottom: 4 },
text: { fontSize: 13 },

modalBg: {
flex: 1,
backgroundColor: "rgba(0,0,0,0.6)",
justifyContent: "center",
alignItems: "center",
},

modalBox: {
width: "90%",
backgroundColor: "#fff",
borderRadius: 20,
padding: 16,
},

imageContainer: {
width: "100%",
height: 180,
justifyContent: "center",
alignItems: "center",
position: "relative",
marginBottom: 10,
},

modalImage: {
width: "100%",
height: 180,
borderRadius: 12,
},

providerImage: {
width: 60,
height: 60,
borderRadius: 30,
position: "absolute",
bottom: -10,
right: 20,
borderWidth: 3,
borderColor: "#fff",
backgroundColor: "#fff",
},

modalTitle: {
fontSize: 18,
fontWeight: "700",
textAlign: "center",
marginBottom: 10,
},

modalText: {
fontSize: 14,
marginBottom: 4,
},

closeBtn: {
marginTop: 15,
backgroundColor: "#333",
padding: 10,
borderRadius: 10,
alignItems: "center",
},

slotHeader: {
  marginTop: 16,
  marginBottom: 10,
  fontWeight: "700",
  fontSize: 15,
},

slotContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
},

slotBorder: {
  borderRadius: 12,
  padding: 2,
  marginRight: 8,
  marginBottom: 8,
},

slotInner: {
  backgroundColor: "#fff",
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 18,
  minWidth: 120,
  alignItems: "center",
},

slotText: {
  fontWeight: "700",
  fontSize: 13,
  color: "#444",
},
modalBox: {
  width: "90%",
  maxHeight: "85%", // ← prevents overflow
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 16,
},

modalScroll: {
  paddingBottom: 30,
},
});