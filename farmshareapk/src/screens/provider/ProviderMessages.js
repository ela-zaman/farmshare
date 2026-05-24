import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

export default function ProviderMessages({ navigation }) {
  const { t } = useTranslation();
  const currentUser = getAuth().currentUser;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= REALTIME CHAT LIST ================= */
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    // 1. Query only documents where the current user is a participant
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    );

    // 2. Attach the snapshot listener
    const unsub = onSnapshot(
      chatsQuery,
      async (snap) => {
        try {
          const data = await Promise.all(
            snap.docs.map(async (chatDoc) => {
              const chatId = chatDoc.id;
              const chatData = chatDoc.data();

              // Find the other user's ID
              const otherUserId = chatData.participants?.find(
                (id) => id !== currentUser.uid
              );

              if (!otherUserId) return null;

              // Fetch the other user's details
              const userSnap = await getDoc(doc(db, "users", otherUserId));
              const userData = userSnap.exists()
                ? userSnap.data()
                : { name: "Unknown", photo: null };

              return {
                chatId,
                userId: otherUserId,
                name: userData.name,
                photo: userData.photo,
              };
            })
          );

          setConversations(data.filter(Boolean));
        } catch (err) {
          console.error("Error processing chat documents: ", err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        console.error("Firestore snapshot error: ", error);
        // Note: If you see a "FAILED_PRECONDITION" error here in your terminal, 
        // click the link provided in the error log to generate the required Firestore index.
      }
    );

    return () => unsub();
  }, [currentUser]);

  /* ================= NAV ================= */
  const openChat = (item) => {
    navigation.navigate("ChatScreen", {
      userId: item.userId,
      userName: item.name,
    });
  };

  const img = (uri) =>
    uri ? { uri } : require("../../../assets/images/add.png");

  /* ================= UI RENDER ================= */
  
  // 1. Loading State
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 2. Empty State (Helps debug data/permission issues)
  if (conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No conversations found</Text>
        <Text style={styles.debugText}>Logged in as ID: {currentUser?.uid || "Not Logged In"}</Text>
      </View>
    );
  }

  // 3. Active List State
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <FlatList
        data={conversations}
        keyExtractor={(i) => i.chatId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openChat(item)}
          >
            <Image source={img(item.photo)} style={styles.avatar} />

            <View style={styles.middle}>
              <Text style={styles.name}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  debugText: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 12,
  },
  middle: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
});