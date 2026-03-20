import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet
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

export default function FarmerNotifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        where("status", "in", ["accepted", "denied"])
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setNotifications(data);
    } catch (err) {
      console.log("Error fetching notifications:", err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>
        {item.status === "accepted"
          ? t("booking_accepted")
          : t("booking_denied")}
      </Text>

      <Text>{t("machine")}: {item.machineType}</Text>
      <Text>{t("dates")}: {item.dates?.join(", ")}</Text>
    </View>
  );

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>{t("no_notifications")}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#e6ffe6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
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