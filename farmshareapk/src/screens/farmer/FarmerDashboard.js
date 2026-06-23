import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";

import { useTranslation } from "react-i18next";
import { logoutUser } from "../../firebase/authService";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("window").width;
const buttonSize = screenWidth / 2 - 30;

export default function FarmerDashboard({ navigation }) {
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    try {
      await logoutUser();

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(
      i18n.language === "en" ? "bn" : "en"
    );
  };

  return (
    <LinearGradient
      colors={["#ffb6c1", "#6a5acd"]}
      style={styles.background}
    >
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 40,
        }}
      >

        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.title}>
            {t("farmer_dashboard")}
          </Text>

          <TouchableOpacity
            style={styles.langButton}
            onPress={toggleLanguage}
          >
            <Text style={styles.langText}>
              {i18n.language === "en"
                ? "BN"
                : "EN"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ROW 1 */}

        <View style={styles.row}>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate(
                "SearchScreen"
              )
            }
          >
            <Image
              source={require("../../../assets/images/Dashboard/search.png")}
              style={styles.icon}
            />

            <Text style={styles.label}>
              {t("search")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate(
                "FarmerNotifications"
              )
            }
          >
            <Image
              source={require("../../../assets/images/Dashboard/contact.png")}
              style={styles.icon}
            />

            <Text style={styles.label}>
              {t("new_order")}
            </Text>
          </TouchableOpacity>

        </View>

        {/* ROW 2 */}

        <View style={styles.row}>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate(
                "MyBookingScreen"
              )
            }
          >
            <Image
              source={require("../../../assets/images/bookings.png")}
              style={styles.icon}
            />

            <Text style={styles.label}>
              {t("my_booking")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate(
                "FarmerMyContact"
              )
            }
          >
            <Image
              source={require("../../../assets/images/Dashboard/contact.png")}
              style={styles.icon}
            />

            <Text style={styles.label}>
              {t("my_contact")}
            </Text>
          </TouchableOpacity>

        </View>

        {/* NEW ROW */}

        <View style={styles.row}>

        <TouchableOpacity
    style={styles.fullButton}
    onPress={() =>
      navigation.navigate("MyBookingCalendar")
    }
  >
    <Image
      source={require("../../../assets/images/calendar.png")}
      style={styles.fullIcon}
    />

    <Text style={styles.label}>
      {t("my_booking_calendar")}
    </Text>
  </TouchableOpacity>


          <View
            style={{
              width: buttonSize,
            }}
          />

        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  header: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },

  langButton: {
    backgroundColor: "#ffffff80",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  langText: {
    fontSize: 14,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 25,
    columnGap: 15,
  },

  button: {
    width: buttonSize,
    height: buttonSize,

    backgroundColor:
      "rgba(255,255,255,0.85)",

    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    padding: 10,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    elevation: 5,
  },

  icon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    resizeMode: "contain",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  logoutButton: {
    marginTop: 40,
    backgroundColor: "#ff4d4d",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fullRow: {
  width: "90%",
  marginBottom: 25,
},

fullButton: {
  width: "100%",
  height: 120,
  backgroundColor: "rgba(255,255,255,0.9)",
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  paddingHorizontal: 20,

  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowOffset: { width: 0, height: 3 },
  shadowRadius: 6,
  elevation: 5,
},

fullIcon: {
  width: 60,
  height: 60,
  marginRight: 15,
  resizeMode: "contain",
},
});