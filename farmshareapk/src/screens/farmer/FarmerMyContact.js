import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../../firebase/authService";

export default function FarmerMyContact() {
  const { t } = useTranslation();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const safe = (v) => (!v ? t("no_data") : String(v));

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const q = query(
        collection(db, "contacts"),
        where("userId", "==", uid)
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setContacts(list);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    if (!phone || phone === "N/A") return;
    Linking.openURL(`tel:${phone}`);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* PROVIDER NAME */}
        <Text style={styles.title}>
          {t("service_provider")}: {safe(item.name)}
        </Text>

        {/* PHONE */}
        <Text style={styles.text}>
          {t("phone")}: {safe(item.phone)}
        </Text>

        {/* MACHINE TYPE */}
        <Text style={styles.text}>
          {t("machine_type")}: {t(item.machineType)}
        </Text>

        {/* CALL BUTTON */}
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => handleCall(item.phone)}
        >
          <Text style={styles.callText}>📞 {t("call")}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={
        <Text style={styles.empty}>
          {t("no_contacts") || "No contacts found"}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },

  text: {
    fontSize: 14,
    marginBottom: 5,
  },

  callBtn: {
    marginTop: 10,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  callText: {
    color: "#fff",
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 100,
    color: "#999",
  },
});