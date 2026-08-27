import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
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
  const month =
    lang === "bn"
      ? BN_MONTHS[d.getMonth()]
      : d.toLocaleDateString("en-GB", { month: "long" });

  const raw = `${day} ${month} ${d.getFullYear()}`;
  return lang === "bn" ? toBn(raw) : raw;
};

/* ================= MACHINE IMAGE ================= */

const getMachineImage = (machine) => {
  const type = (machine?.machineType || "").toLowerCase();

  if (machine?.machineImage) return { uri: machine.machineImage };
  if (type === "tractor") return require("../../../assets/images/Machines/tractor.png");
  if (type === "powertiller") return require("../../../assets/images/Machines/powertiller.png");
  if (type === "reaper") return require("../../../assets/images/Machines/reaper.png");
  if (type === "sprayer") return require("../../../assets/images/Machines/sprayer.jpg");
  if (type === "thresher") return require("../../../assets/images/Machines/thresher.png");
  if (type === "combine harvester") return require("../../../assets/images/Machines/combine harvester.png");

  return require("../../../assets/images/Machines/bed planter.png");
};

/* ================= SLOT LABEL ================= */

const getSlotLabel = (start, lang, t) => {
  const periodMap = {
    morning: t("morning"),
    noon: t("noon"),
    afternoon: t("afternoon"),
    evening: t("evening"),
  };

  let period = "";
  if (start >= 5 && start < 12) period = periodMap.morning;
  else if (start >= 12 && start < 15) period = periodMap.noon;
  else if (start >= 15 && start < 18) period = periodMap.afternoon;
  else period = periodMap.evening;

  const hour = (h) => (h % 12 === 0 ? 12 : h % 12);

  const s = `${hour(start)} - ${hour(start + 1)}`;

  return lang === "bn"
    ? `${period} ${toBn(s)}`
    : `${period} ${s}`;
};

export default function FarmerBookings() {
  const { t, i18n } = useTranslation();
  const user = getAuth().currentUser;

  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  const prevCount = useRef(0);

  /* ================= FIRESTORE ================= */

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      where("status", "==", "accepted")
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

      setBookings(list);

      if (list.length > prevCount.current) {
        Alert.alert(t("notification"), t("new_booking_update"));
      }

      prevCount.current = list.length;
    });

    return () => unsub();
  }, [user]);

  /* ================= GROUP BY DATE ================= */

  const grouped = bookings.reduce((acc, b) => {
    const date = b.dates?.[0];
    if (!date) return acc;

    if (!acc[date]) acc[date] = [];
    acc[date].push(b);

    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  /* ================= UI ================= */

  return (
    <View style={{ flex: 1, padding: 15 }}>

      {/* ========== DATE LIST ========== */}
      <Text style={styles.header}>{t("booked_days")}</Text>

      <FlatList
        data={sortedDates}
        keyExtractor={(i) => i}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setSelectedDate(item)}
          >
            <Text style={styles.dateText}>
              {formatDate(item, i18n.language)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* ========== SLOTS ========== */}
      {selectedDate && (
        <>
          <Text style={styles.header}>{t("time_slots")}</Text>

          {grouped[selectedDate].map((b, i) =>
            b.slots?.map((s, j) => {
              const [start] = s.split("-").map(Number);

              return (
                <TouchableOpacity
                  key={`${i}-${j}`}
                  style={styles.slotBox}
                  onPress={() => {
                    setSelectedSlot(b);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.slotText}>
                    {getSlotLabel(start, i18n.language, t)}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </>
      )}

      {/* ========== MODAL ========== */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.modalBox}>

            {selectedSlot && (
              <>
                {/* IMAGE CENTER OVERLAP */}
                <View style={styles.imageWrap}>
                  <Image
                    source={getMachineImage(selectedSlot.machine)}
                    style={styles.machineImg}
                  />

                  <Image
                    source={
                      selectedSlot.provider?.photo
                        ? { uri: selectedSlot.provider.photo }
                        : require("../../../assets/images/user.jpg")
                    }
                    style={styles.providerImg}
                  />
                </View>

                <Text style={styles.title}>
                  {t("booking_details")}
                </Text>

                <Text>{t("provider_name")}: {selectedSlot.provider?.name}</Text>
                <Text>{t("phone")}: {selectedSlot.provider?.phone}</Text>
                <Text>{t("machine_type")}: {selectedSlot.machine?.machineType}</Text>
                <Text>{t("charge_type")}: {t(selectedSlot.chargeType)}</Text>
                <Text>{t("total_charge")}: {selectedSlot.totalCharge}</Text>
                <Text>{t("land_address")}: {selectedSlot.address}</Text>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: "#fff" }}>{t("close")}</Text>
                </TouchableOpacity>
              </>
            )}

          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
  },

  dateBox: {
    padding: 12,
    backgroundColor: "#f2f2f2",
    marginBottom: 8,
    borderRadius: 10,
  },

  dateText: {
    fontSize: 15,
    fontWeight: "600",
  },

  slotBox: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopColor: "#4f8cff",
    borderBottomColor: "#ff4fa0",
  },

  slotText: {
    fontWeight: "600",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalBox: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 15,
    padding: 15,
  },

  imageWrap: {
    alignItems: "center",
    marginBottom: 15,
  },

  machineImg: {
    width: 120,
    height: 120,
    borderRadius: 15,
  },

  providerImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "absolute",
    bottom: -10,
    right: 120,
    borderWidth: 2,
    borderColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  closeBtn: {
    marginTop: 20,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  }, 
});