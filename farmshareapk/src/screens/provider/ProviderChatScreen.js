import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import {
  collection,
  doc,
  getDoc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function ChatScreen({ route }) {
  const { userId, userName } = route.params;

  const { t } = useTranslation();
  const currentUser = getAuth().currentUser;
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatId, setChatId] = useState(null);
  const [profile, setProfile] = useState(null);

  /* ================= CHAT INIT ================= */
  useEffect(() => {
    if (!currentUser || !userId) return;

    const initChat = async () => {
      const id =
        currentUser.uid > userId
          ? currentUser.uid + "_" + userId
          : userId + "_" + currentUser.uid;

      setChatId(id);

      const chatRef = doc(db, "chats", id);
      const snap = await getDoc(chatRef);

      // Initialize parent chat document structure if it doesn't exist
      if (!snap.exists()) {
        await setDoc(chatRef, {
          participants: [currentUser.uid, userId],
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
        });
      }
    };

    initChat();
  }, [currentUser, userId]);

  /* ================= PROFILE ================= */
  useEffect(() => {
    if (!userId) return;
    const loadProfile = async () => {
      const u = await getDoc(doc(db, "users", userId));
      if (u.exists()) setProfile(u.data());
    };

    loadProfile();
  }, [userId]);

  /* ================= MESSAGES ================= */
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, [chatId]);

  /* ================= SEND ================= */
  const sendMessage = async () => {
    if (!text.trim() || !chatId) return;

    const messageText = text.trim();
    setText(""); // Instant UI input clearing

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      // STEP 1: Always establish/update parent document presence FIRST.
      // This guarantees Security Rules see your ID in "participants" before subcollection logic executes.
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [currentUser.uid, userId],
          createdAt: serverTimestamp(),
          lastMessage: messageText,
          lastMessageAt: serverTimestamp(),
        });
      } else {
        await updateDoc(chatRef, {
          lastMessage: messageText,
          lastMessageAt: serverTimestamp(),
          participants: [currentUser.uid, userId], 
        });
      }

      // STEP 2: Safely add the child message document into the subcollection
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: messageText,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const img = profile?.photo
    ? { uri: profile.photo }
    : require("../../../assets/images/add.png");

  /* ================= FORMAT TIME ================= */
  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "";

    const d = timestamp.toDate();
    return d.toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  /* ================= MESSAGE UI ================= */
  const renderItem = ({ item }) => {
    const isMe = item.senderId === currentUser.uid;

    return (
      <View style={[styles.msgBox, styles.whiteBubble, isMe ? styles.myMsg : styles.theirMsg]}>
        <Text style={styles.msgText}>{item.text}</Text>
        <Text style={styles.timeText}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/background5.png")}
      style={styles.bg}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 80}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Image source={img} style={styles.avatar} />
            <Text style={styles.name}>{userName}</Text>
          </View>

          {/* CHAT */}
          <FlatList
            data={messages}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{
              padding: 10,
              paddingBottom: 80,
            }}
          />

          {/* INPUT */}
          <View
            style={[
              styles.inputRow,
              { paddingBottom: insets.bottom + 8 },
            ]}
          >
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder={t("type_message")}
              placeholderTextColor="#777"
            />

            <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "rgba(46,125,50,0.95)",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  msgBox: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 12,
    maxWidth: "75%",
  },
  whiteBubble: {
    backgroundColor: "#fff",
  },
  myMsg: {
    alignSelf: "flex-end",
  },
  theirMsg: {
    alignSelf: "flex-start",
  },
  msgText: {
    color: "#000",
    fontSize: 14,
  },
  timeText: {
    fontSize: 10,
    color: "#777",
    marginTop: 4,
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 20,
  },
});