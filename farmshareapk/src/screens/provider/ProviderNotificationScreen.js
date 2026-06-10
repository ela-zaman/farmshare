import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";

import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

/* ================= SOUND ================= */
const playSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../../../assets/sounds/notification.mp3")
    );
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync(), 1200);
  } catch (e) {}
};

/* ================= MACHINE IMAGE ================= */
const getFallback = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "tractor")
    return require("../../../assets/images/Machines/tractor.png");
  if (t === "powertiller")
    return require("../../../assets/images/Machines/powertiller.png");
  if (t === "reaper")
    return require("../../../assets/images/Machines/reaper.png");
  if (t === "sprayer")
    return require("../../../assets/images/Machines/sprayer.jpg");
  if (t === "thresher")
    return require("../../../assets/images/Machines/thresher.png");

  return require("../../../assets/images/Machines/tractor.png");
};

export default function ProviderNotificationScreen({ navigation }) {
  const { t } = useTranslation();
  const provider = getAuth().currentUser;

  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [machineMap, setMachineMap] = useState({});

  /* ================= LOAD MACHINES ================= */
  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "machines"));
      const map = {};
      snap.forEach((d) => (map[d.id] = d.data()));
      setMachineMap(map);
    };
    load();
  }, []);

  /* ================= BOOKINGS ================= */
  useEffect(() => {
    if (!provider) return;

    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", provider.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setNotifications(data);
      playSound();
    });

    return () => unsub();
  }, [provider]);

  /* ================= IMAGE ================= */
  const getImage = (item) => {
    const img = machineMap?.[item.machineId]?.machineImage;
    return img ? { uri: img } : getFallback(item.machineType);
  };

  /* ================= OPEN MODAL ================= */
  const openModal = (item) => {
    setSelected(item);
    setModalVisible(true);
  };

  /* ================= ACCEPT / DENY ================= */
  const handleDecision = async (id, status) => {
    await updateDoc(doc(db, "bookings", id), { status });

    setNotifications((prev) => prev.filter((i) => i.id !== id));
    setModalVisible(false);
  };

  /* ================= LIST CARD (YOUR UI EXACT) ================= */
  const renderCard = ({ item }) => {
    const isRead = item.isRead === true;

    return (
      <TouchableOpacity onPress={() => openModal(item)}>

        <LinearGradient
          key={item.id}
          colors={
            isRead
              ? ["#FFF0F0", "#FFE0E0"]
              : ["#F0FFF4", "#E0FFE6"]
          }
          style={styles.card}
        >

          <View style={styles.imageWrap}>
            <Image
              source={getImage(item)}
              style={styles.machineImage}
            />

            {/* FARMER IMAGE */}
            <Image
              source={
                item.userPhoto
                  ? { uri: item.userPhoto }
                  : require("../../../assets/images/add.png")
              }
              style={styles.userImage}
            />
          </View>

          <Text style={styles.title}>{t(item.machineType)}</Text>

          {/* USER INFO */}
          <Text style={styles.text}>
            👤 {t("farmer_name")}: {item.userName}
          </Text>

          <Text style={styles.text}>
            📞 {t("phone_number")}: {item.userPhone}
          </Text>

          <Text style={styles.text}>
            💰 {t("total_charge")}: {item.totalCharge}
          </Text>

          <Text style={styles.text}>
            📍 {t("land_address")}: {item.landAddress}
          </Text>

          <Text style={styles.text}>
            ⚙️ {t("charge_type")}: {item.chargeType}
          </Text>

          <Text style={styles.text}>
            🌾 {t("tillage_number")}: {item.tillageAmount}
          </Text>

        </LinearGradient>
      </TouchableOpacity>
    );
  };

  /* ================= UI ================= */
  return (
    <View style={{ flex: 1, backgroundColor: "#F4F7FF" }}>

      <FlatList
        data={notifications}
        keyExtractor={(i) => i.id}
        renderItem={renderCard}
        contentContainerStyle={{ padding: 15 }}
      />

      {/* ================= MODAL (YOUR UI PRESERVED) ================= */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>

          <LinearGradient
            colors={["#FDE2FF", "#D6EEFF"]}
            style={styles.modalCard}
          >

            <Image
              source={getImage(selected || {})}
              style={styles.modalImage}
            />

            <Text style={styles.title}>
              {t(selected?.machineType)}
            </Text>

            {/* FARMER IMAGE */}
            <Image
              source={
                selected?.userPhoto
                  ? { uri: selected.userPhoto }
                  : require("../../../assets/images/add.png")
              }
              style={styles.userImage}
            />

            <Text style={styles.text}>
              👤 {t("farmer_name")}: {selected?.userName}
            </Text>

            <Text style={styles.text}>
              📞 {t("phone_number")}: {selected?.userPhone}
            </Text>

            <Text style={styles.text}>
              💰 {t("total_charge")}: {selected?.totalCharge}
            </Text>

            <Text style={styles.text}>
              📍 {t("land_address")}: {selected?.landAddress}
            </Text>

            <Text style={styles.text}>
              ⚙️ {t("charge_type")}: {selected?.chargeType}
            </Text>

            <Text style={styles.text}>
              🌾 {t("tillage_number")}: {selected?.tillageAmount}
            </Text>

            {/* SLOT (UNCHANGED) */}
            <Text style={styles.slotTitle}>⏰ {t("time_slot")}</Text>

            <View style={styles.slotWrap}>
              {selected?.slots?.map((slot, i) => {
                const [start, end] = slot.split("-");
                return (
                  <View key={i} style={styles.slotCard}>
                    <Text style={styles.slotText}>
                      {start}:00 - {end}:00
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* ACTIONS */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.accept}
                onPress={() =>
                  handleDecision(selected.id, "accepted")
                }
              >
                <Text style={styles.btnText}>✅ {t("accept")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deny}
                onPress={() =>
                  handleDecision(selected.id, "denied")
                }
              >
                <Text style={styles.btnText}>❌ {t("deny")}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>

          </LinearGradient>
        </View>
      </Modal>

    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({

  card: {
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
  },

  imageWrap: {
    alignItems: "center",
    position: "relative",
    marginBottom: 15,
  },

  machineImage: {
    width: 170,
    height: 120,
    borderRadius: 15,
  },

  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: "absolute",
    bottom: -15,
    right: 80,
    borderWidth: 2,
    borderColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0D47A1",
  },

  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0D47A1",
  },

  slotTitle: {
    marginTop: 10,
    fontWeight: "bold",
  },

  slotWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  slotCard: {
    backgroundColor: "#fff",
    padding: 6,
    margin: 3,
    borderRadius: 10,
  },

  slotText: {
    fontWeight: "bold",
    color: "#0D47A1",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "92%",
    borderRadius: 25,
    padding: 15,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
  },

  accept: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 15,
    marginRight: 5,
    alignItems: "center",
  },

  deny: {
    flex: 1,
    backgroundColor: "#E53935",
    padding: 12,
    borderRadius: 15,
    marginLeft: 5,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  close: {
    textAlign: "center",
    marginTop: 10,
    color: "#0D47A1",
    fontWeight: "bold",
  },
});