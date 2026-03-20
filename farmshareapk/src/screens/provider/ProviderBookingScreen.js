import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function ProviderBookingScreen() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);

  const auth = getAuth();
  const provider = auth.currentUser;

  useEffect(() => {
    if (provider) fetchBookings();
  }, [provider]);

  const fetchBookings = async () => {
    try {
      const q = query(
        collection(db, "bookings"),
        where("providerId", "==", provider.uid),
        where("status", "==", "accepted")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setBookings(data);
    } catch (err) {
      console.log("Error fetching bookings:", err);
    }
  };

  // Machine image mapping
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={getMachineImage(item.machineType)}
        style={styles.image}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.machineType}</Text>
        <Text>{t("farmer")}: {item.userId}</Text>
        <Text>{t("dates")}: {item.dates?.join(", ")}</Text>
        <Text style={{ color: "green" }}>
          {t("booking_accepted")}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>{t("no_bookings")}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#f0fff0",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 10,
    resizeMode: "contain"
  },
  title: {
    fontWeight: "700",
    marginBottom: 5
  },
  center: {
    alignItems: "center",
    marginTop: 50
  }
});