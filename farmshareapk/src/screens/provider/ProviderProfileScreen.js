import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image
} from "react-native";

import { db, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function ProviderProfileScreen() {
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log("No user data found!");
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("no_user_data")}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* ✅ PROFILE IMAGE */}
      <View style={styles.imageWrapper}>
        {userData.photo ? (
          <Image
            source={{ uri: userData.photo }}
            style={styles.profileImage}
          />
        ) : (
          <Ionicons name="person-circle" size={120} color="#ccc" />
        )}
      </View>

      {/* Name */}
      <View style={styles.item}>
        <Ionicons name="person-circle-outline" size={28} color="#4CAF50" />
        <View style={styles.textContainer}>
          <Text style={styles.label}>{t("name")}</Text>
          <Text style={styles.value}>{userData.name}</Text>
        </View>
      </View>

      {/* Phone */}
      <View style={styles.item}>
        <Ionicons name="call-outline" size={28} color="#4CAF50" />
        <View style={styles.textContainer}>
          <Text style={styles.label}>{t("phone")}</Text>
          <Text style={styles.value}>{userData.phone}</Text>
        </View>
      </View>

      {/* Role */}
      <View style={styles.item}>
        <MaterialIcons name="work-outline" size={28} color="#4CAF50" />
        <View style={styles.textContainer}>
          <Text style={styles.label}>{t("role")}</Text>
          <Text style={styles.value}>Service {userData.role}</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.item}>
        <Ionicons name="location-outline" size={28} color="#4CAF50" />
        <View style={styles.textContainer}>
          <Text style={styles.label}>{t("address")}</Text>
          <Text style={styles.value}>{userData.address}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

/* --------------------------- */
/* Styles                      */
/* --------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  imageWrapper: {
    alignItems: "center",
    marginBottom: 20
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#4CAF50"
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2
  },

  textContainer: {
    marginLeft: 15,
    flex: 1
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 4
  },

  value: {
    fontSize: 16,
    color: "#222"
  }
});