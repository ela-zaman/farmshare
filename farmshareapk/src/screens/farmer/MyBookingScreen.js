import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase/authService";

// ---------------- IMAGE MAPPER ----------------
const getMachineImage = (machineType) => {
  if (!machineType) {
    return require("../../../assets/images/add.png");
  }

  const type = machineType.toLowerCase().replace("_", " ").trim();

  switch (type) {
    case "tractor":
      return require("../../../assets/images/Machines/tractor.png");
    case "powertiller":
    case "power tiller":
      return require("../../../assets/images/Machines/powertiller.png");
    case "reaper":
      return require("../../../assets/images/Machines/reaper.png");
    case "sprayer":
      return require("../../../assets/images/Machines/sprayer.jpg");
    case "thresher":
      return require("../../../assets/images/Machines/thresher.png");
    case "combine harvester":
      return require("../../../assets/images/Machines/combine harvester.png");
    case "bed planter":
      return require("../../../assets/images/Machines/bed planter.png");
    default:
      return require("../../../assets/images/add.png");
  }
};

// ---------------- COMPONENT ----------------
export default function MyBookingScreen({ navigation }) {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchBookings(user.uid);
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ---------------- FETCH BOOKINGS ----------------
  const fetchBookings = async (uid) => {
    try {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", uid),
        where("status", "==", "accepted")
      );

      const snapshot = await getDocs(q);

      const uniqueMap = new Map();

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (!data.machineId) continue;

        // ✅ FETCH MACHINE INFO
        const machineRef = doc(db, "machines", data.machineId);
        const machineSnap = await getDoc(machineRef);

        if (!machineSnap.exists()) continue;

        const machineData = machineSnap.data();

        const typeKey = machineData.machineType
          ?.toLowerCase()
          .replace("_", " ")
          .trim();

        if (!typeKey) continue;

        if (!uniqueMap.has(typeKey)) {
          uniqueMap.set(typeKey, {
            id: docSnap.id,
            machineType: machineData.machineType,
            district: machineData.district || "Unknown",
            count: 1,
          });
        } else {
          const existing = uniqueMap.get(typeKey);
          existing.count += 1;
        }
      }

      setBookings(Array.from(uniqueMap.values()));
      setLoading(false);
    } catch (error) {
      console.log("FETCH ERROR:", error);
      setLoading(false);
    }
  };

  // ---------------- RENDER ----------------
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("BookedMachine", {
          machineType: item.machineType,
        })
      }
    >
      <Image
        source={getMachineImage(item.machineType)}
        style={styles.image}
      />

      <View style={styles.textContainer}>
        <Text style={styles.machineType}>
          {t(item.machineType)} ({item.count})
        </Text>

        <Text style={styles.subText}>
          {item.district || t("unknown")}
        </Text>

        <Text style={styles.accepted}>
          {t("accepted") || "Accepted"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bookings.length === 0 ? (
        <Text style={styles.emptyText}>
          {t("no_accepted_bookings") || "No accepted bookings found"}
        </Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item, index) =>
            item?.id ? String(item.id) : String(index)
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
  },
  image: { width: 70, height: 70, borderRadius: 10, marginRight: 15 },
  textContainer: { flex: 1 },
  machineType: { fontSize: 18, fontWeight: "bold", color: "navy" },
  subText: { fontSize: 14, color: "gray", marginTop: 4 },
  accepted: { marginTop: 5, color: "green", fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "gray" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});