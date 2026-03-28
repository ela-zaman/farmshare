import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/authService";

export default function BookedMachine({ route }) {
  const { t } = useTranslation();

  const machineTypeParam = route?.params?.machineType ?? "unknown";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeToString = (value) => {
    try {
      if (value === null || value === undefined) return t("no_data");
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    } catch {
      return t("no_data");
    }
  };

  const isPastBooking = (dateValue) => {
    try {
      if (!dateValue) return false;

      const bookingDate = new Date(dateValue);
      if (isNaN(bookingDate.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      bookingDate.setHours(0, 0, 0, 0);

      return bookingDate < today;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [machineTypeParam]);

  const fetchBookings = async () => {
    try {
      setError(null);

      const q = query(
        collection(db, "bookings"),
        where("machineType", "==", machineTypeParam),
        where("status", "==", "accepted")
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          providerName: data.userName || "Unknown User",
          providerPhone: data.userPhone || "",
          machineType: data.machineType || "",
          address: data.upazilla || data.address || "",
          landSize: data.landSize || "",
          tillageAmount: data.tillageAmount || data.tillageNumber || "",
          chargeType: data.chargeType || "",
          date: data.dates && data.dates[0] ? data.dates[0] : "",
          timeSlots: data.slots ? data.slots.join(", ") : "",
          totalTaka: data.totalCharge || 0,
        };
      });

      setBookings(list);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getImage = (type) => {
    const safeType = type ? String(type).toLowerCase().trim() : "";

    switch (safeType) {
      case "tractor":
        return require("../../../assets/images/Machines/tractor.png");
      case "powertiller":
      case "power tiller":
        return require("../../../assets/images/Machines/powertiller.png");
      case "reaper":
        return require("../../../assets/images/Machines/reaper.png");
      case "bed planter":
        return require("../../../assets/images/Machines/bed planter.png");
      case "combine harvester":
        return require("../../../assets/images/Machines/combine harvester.png");
      case "thresher":
        return require("../../../assets/images/Machines/thresher.png");
      case "sprayer":
        return require("../../../assets/images/Machines/sprayer.jpg");
      default:
        return require("../../../assets/images/add.png");
    }
  };

  const renderItem = ({ item }) => {
    let formattedDate = t("no_data");

    if (item.date) {
      const d = new Date(item.date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString();
      }
    }

    const isPast = isPastBooking(item.date);

    const backgroundColor = isPast
      ? "rgba(255, 0, 0, 0.2)"
      : "rgba(0, 128, 0, 0.2)";

    return (
      <View style={[styles.card, { backgroundColor }]}>
        <View style={styles.imgContainer}>
          <Image source={getImage(item.machineType)} style={styles.machineImg} />
        </View>

        <View style={styles.content}>
          {/* ✅ Farmer Name */}
          <Text style={styles.providerTitle}>
            {t("farmer_name")}: {safeToString(item.providerName)}
          </Text>

          {/* Machine Type */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("machine_type")}:</Text>
            <Text style={styles.detailValue}>
              {safeToString(item.machineType)}
            </Text>
          </View>

          {/* Phone */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("phone")}:</Text>
            <Text style={styles.detailValue}>
              {safeToString(item.providerPhone)}
            </Text>
          </View>

          {/* Address */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("address")}:</Text>
            <Text style={styles.detailValue}>
              {safeToString(item.address)}
            </Text>
          </View>

          {/* Land Size */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("land_size")}:</Text>
            <Text style={styles.detailValue}>
              {safeToString(item.landSize)}
            </Text>
          </View>

          {/* Tillage Amount */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("tillage_amount")}:</Text>
            <Text style={styles.detailValue}>
              {safeToString(item.tillageAmount)}
            </Text>
          </View>

          {/* Charge Type */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("charge_type")}:</Text>
            <Text style={styles.detailValue}>
              {safeToString(item.chargeType)}
            </Text>
          </View>

          {/* Date */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("date")}:</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>

          {/* Time */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("time_slots")}:</Text>
            <Text style={styles.detailValue}>
              {safeToString(item.timeSlots)}
            </Text>
          </View>

          {/* Total */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("total_charge")}:</Text>
            <Text style={styles.detailValue}>৳{item.totalTaka}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyMsg}>{t("no_bookings")}</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginTop: 40,
    marginBottom: 20,
    borderWidth: 1,
  },
  imgContainer: {
    position: "absolute",
    top: -40,
    alignSelf: "center",
    backgroundColor: "#FFF",
    borderRadius: 40,
    padding: 4,
  },
  machineImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  content: {
    marginTop: 40,
  },
  providerTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  detailLabel: {
    fontWeight: "700",
    color: "#666",
  },
  detailValue: {
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  emptyMsg: {
    textAlign: "center",
    marginTop: 100,
    color: "#999",
  },
});