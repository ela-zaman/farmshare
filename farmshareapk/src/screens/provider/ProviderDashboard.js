import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;
const buttonSize = (screenWidth / 2) - 30;

export default function ProviderDashboard({ navigation }) {
  const { t } = useTranslation();
  const provider = getAuth().currentUser;

  const [pendingCount, setPendingCount] = useState(0);

  /* ================= TODAY ================= */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* ================= FETCH + FILTER ================= */
  useEffect(() => {
    if (!provider) return;

    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", provider.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const bookings = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const filtered = bookings.filter((b) => {
        /* ================= STATUS CHECK ================= */
        const isPending =
          (b.status || "").toLowerCase().trim() === "pending";

        /* ================= DATE CHECK (TODAY + FUTURE) ================= */
        const hasValidDate =
          Array.isArray(b.dates) &&
          b.dates.some((dateStr) => {
            const d = new Date(dateStr);
            d.setHours(0, 0, 0, 0);
            return d >= today;
          });

        return isPending && hasValidDate;
      });

      setPendingCount(filtered.length);
    });

    return () => unsub();
  }, [provider]);

  return (
    <LinearGradient
      colors={["#FFB6C1", "#ADD8E6", "#FFC0CB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* STATUS CARD */}
        <TouchableOpacity
          style={styles.statusCard}
          onPress={() => navigation.navigate("ProviderCurrentStatus")}
        >
          <Image
            source={require("../../../assets/images/Dashboard/Current Status.png")}
            style={styles.statusImage}
          />

          <View>
            <Text style={styles.statusTitle}>
              {t("current_status")}
            </Text>
            <Text style={styles.statusSubtitle}>
              {t("check_machine_availability")}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ROW 1 */}
        <View style={styles.row}>

          {/* ADD MACHINERY */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("AddMachinery")}
          >
            <Image
              source={require("../../../assets/images/Machines/machine.jpg")}
              style={styles.icon}
            />
            <Text style={styles.label}>{t("add_machinery")}</Text>
          </TouchableOpacity>

          {/* BOOKING REQUESTS */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ProviderBookingRequests")}
          >
            <Image
              source={require("E:/farmshare/farmshare/farmshareapk/assets/images/Dashboard/request.png")}
              style={styles.icon}
            />

            <Text style={styles.label}>{t("booking_requests")}</Text>

            {/* 🔴 BADGE */}
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {pendingCount > 99 ? "99+" : pendingCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

        </View>

        {/* ROW 2 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ProviderBookingScreen")}
          >
            <Image
              source={require("../../../assets/images/Dashboard/bookings.png")}
              style={styles.icon}
            />
            <Text style={styles.label}>{t("my_bookings")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ProviderMyContact")}
          >
            <Image
              source={require("../../../assets/images/Dashboard/contact.png")}
              style={styles.icon}
            />
            <Text style={styles.label}>{t("my_contact")}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  container: {
    padding: 15,
    flexGrow: 1,
    alignItems: "center",
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    width: "100%",
  },

  statusImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  statusSubtitle: {
    fontSize: 13,
    color: "#555",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },

  button: {
    width: buttonSize,
    height: buttonSize,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  icon: {
    width: 100,
    height: 100,
    marginBottom: 10,
     resizeMode: "contain",
  },

  label: {
    fontSize: 14,
    textAlign: "center",
  },

  /* BADGE */
  badge: {
    position: "absolute",
    top: 8,
    right: 10,
    backgroundColor: "red",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});