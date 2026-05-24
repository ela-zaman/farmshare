import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";

import { useTranslation } from "react-i18next";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderMyContact({ navigation }) {
  const { t } = useTranslation();
  const provider = getAuth().currentUser;

  const [contacts, setContacts] = useState([]);

  /* ================= REALTIME CONTACTS ================= */
  useEffect(() => {
    if (!provider) return;

    const q = query(
      collection(db, "contacts"),
      where("providerId", "==", provider.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const raw = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const enriched = await Promise.all(
        raw.map(async (c) => {
          try {
            const u = await getDoc(doc(db, "users", c.userId));
            return {
              ...c,
              name: u.exists() ? u.data().name : "Unknown",
              phone: u.exists() ? u.data().phone : "",
              photo: u.exists() ? u.data().photo : null,
            };
          } catch (e) {
            return c;
          }
        })
      );

      setContacts(enriched);
    });

    return () => unsub();
  }, [provider]);

  /* ================= CALL ================= */
  const handleCall = (phone) => {
    if (!phone) return Alert.alert(t("error"), t("no_phone"));
    Linking.openURL(`tel:${phone}`);
  };

  /* ================= MESSAGE ================= */
  const handleMessage = (item) => {
    navigation.navigate("ChatScreen", {
      userId: item.userId,
      userName: item.name,
    });
  };

  /* ================= IMAGE ================= */
  const getImage = (photo) =>
    photo ? { uri: photo } : require("../../../assets/images/add.png");

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }) => (
    <View style={styles.card}>

      {/* LEFT: IMAGE */}
      <Image source={getImage(item.photo)} style={styles.avatar} />

      {/* CENTER: NAME + PHONE */}
      <View style={styles.middle}>
        <Text style={styles.name}>{item.name}</Text>

        {/* NEW PHONE TEXT */}
        <Text style={styles.phone}>
          {t("phone")}: {item.phone || t("no_phone")}
        </Text>
      </View>

      {/* RIGHT: BUTTONS */}
      <View style={styles.actions}>

        {/* CALL BUTTON */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleCall(item.phone)}
        >
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.iconText}>{t("call")}</Text>
        </TouchableOpacity>

        {/* MESSAGE BUTTON */}
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: "#1565C0" }]}
          onPress={() => handleMessage(item)}
        >
          <Ionicons name="chatbubble" size={18} color="#fff" />
          <Text style={styles.iconText}>{t("message")}</Text>
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

/* ================= STYLES ================= */
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

  // NEW STYLE
  phone: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  actions: {
    flexDirection: "column",
    gap: 8,
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