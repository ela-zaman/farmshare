import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";

import { useTranslation } from "react-i18next";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderMyContact() {
  const { t } = useTranslation();
  const provider = getAuth().currentUser;

  const [contacts, setContacts] = useState([]);

  // ================= REALTIME CONTACTS =================
  useEffect(() => {
    if (!provider) return;

    const q = query(
      collection(db, "providerContact"),
      where("providerId", "==", provider.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setContacts(data);
    });

    return () => unsub();
  }, [provider]);

  // ================= CALL =================
  const handleCall = (phone) => {
    if (!phone) {
      Alert.alert(t("error"), t("no_phone"));
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  // ================= IMAGE =================
  const getImage = (photo) => {
    if (!photo) return require("../../../assets/images/add.png");
    return { uri: photo };
  };

  // ================= RENDER ITEM =================
  const renderItem = ({ item }) => (
    <View style={styles.card}>

      {/* LEFT: IMAGE */}
      <Image source={getImage(item.photo)} style={styles.avatar} />

      {/* CENTER: INFO */}
      <View style={styles.middle}>
        <Text style={styles.name}>
          {item.farmerName || "Unknown"}
        </Text>

        <Text style={styles.phone}>
          {t("phone")}: {item.phone || t("no_phone")}
        </Text>
      </View>

      {/* RIGHT: ACTION */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleCall(item.phone)}
        >
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.iconText}>{t("call")}</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={contacts}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
      />
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 3,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 10,
  },

  middle: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },

  phone: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  actions: {
    flexDirection: "column",
  },

  iconBtn: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: 70,
  },

  iconText: {
    fontSize: 10,
    color: "#fff",
    marginTop: 2,
  },
});