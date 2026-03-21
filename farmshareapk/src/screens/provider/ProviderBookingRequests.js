import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  Image,
  Alert
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function ProviderBookingRequests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const auth = getAuth();
  const provider = auth.currentUser;

  useEffect(() => {
    if (provider) fetchRequests();
  }, [provider]);

  // ---------------------------
  // Fetch Booking Requests + Farmer Info
  // ---------------------------
  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "bookings"),
        where("providerId", "==", provider.uid),
        where("status", "==", "pending")
      );

      const snapshot = await getDocs(q);

      const result = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const booking = docSnap.data();

          // 🔥 Get farmer info from users collection
          let farmerName = "Unknown";
          let farmerPhone = "N/A";

          try {
            const userQuery = query(
              collection(db, "users"),
              where("uid", "==", booking.userId)
            );
            const userSnap = await getDocs(userQuery);

            if (!userSnap.empty) {
              const userData = userSnap.docs[0].data();
              farmerName = userData.userName || "Unknown";
              farmerPhone = userData.userPhone || "N/A";
            }
          } catch (err) {
            console.log("Error fetching user:", err);
          }

          return {
            id: docSnap.id,
            ...booking,
            farmerName,
            farmerPhone
          };
        })
      );

      setRequests(result);
    } catch (err) {
      console.log("Error fetching requests:", err);
    }
  };

  // ---------------------------
  // Accept / Deny Booking
  // ---------------------------
  const handleDecision = async (id, decision) => {
    try {
      await updateDoc(doc(db, "bookings", id), {
        status: decision
      });

      Alert.alert(
        t("success"),
        decision === "accepted"
          ? t("booking_accepted")
          : t("booking_denied")
      );

      fetchRequests();
    } catch (err) {
      console.log("Error updating booking:", err);
      Alert.alert(t("error"), t("update_failed"));
    }
  };

  // ---------------------------
  // Machine Image Mapping
  // ---------------------------
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

    return IMAGE_MAP[key] || require("../../../assets/images/add.png");
  };

  // ---------------------------
  // Render Card
  // ---------------------------
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Left Image */}
      <Image
        source={getMachineImage(item.machineType)}
        style={styles.image}
      />

      {/* Right Info */}
      <View style={styles.info}>
        <Text style={styles.title}>{item.machineType}</Text>

        <Text>{t("farmer_name")}: {item.userName}</Text>
        <Text>{t("phone")}: {item.userPhone}</Text>

        <Text>{t("dates")}:</Text>
        <Text style={{ fontSize: 12 }}>
          {item.dates?.join(", ")}
        </Text>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Button
            title={t("accept")}
            onPress={() => handleDecision(item.id, "accepted")}
          />
          <View style={{ width: 10 }} />
          <Button
            title={t("deny")}
            color="red"
            onPress={() => handleDecision(item.id, "denied")}
          />
        </View>
      </View>
    </View>
  );

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>{t("no_requests")}</Text>
        </View>
      }
    />
  );
}

// ---------------------------
// Styles
// ---------------------------
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#e6f2ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginRight: 10
  },
  info: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 8
  },
  center: {
    alignItems: "center",
    marginTop: 50
  }
});