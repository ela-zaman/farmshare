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
  ImageBackground
} from "react-native";
import { useTranslation } from "react-i18next";
import { logoutUser } from "../../firebase/authService";

const screenWidth = Dimensions.get("window").width;
const buttonSize = (screenWidth / 2) - 30;

export default function FarmerDashboard({ navigation }) {
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/background6.png")} // ✅ your background image
      style={styles.background}
      resizeMode="cover"
    >
      {/* OPTIONAL OVERLAY (improves readability) */}
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 30 }}
        >

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("farmer_dashboard")}</Text>

            <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
              <Text style={styles.langText}>
                {i18n.language === "en" ? "BN" : "EN"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ROW 1 */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("SearchScreen")}
            >
              <Image
                source={require("../../../assets/images/Dashboard/search.png")}
                style={styles.icon}
              />
              <Text style={styles.label}>{t("search")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("FarmerNotifications")}
            >
              <Image
                source={require("../../../assets/images/Dashboard/contact.png")}
                style={styles.icon}
              />
              <Text style={styles.label}>{t("new_order")}</Text>
            </TouchableOpacity>
          </View>

          {/* ROW 2 */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("MyBookingScreen")}
            >
              <Image
                source={require("../../../assets/images/bookings.png")}
                style={styles.icon}
              />
              <Text style={styles.label}>{t("my_booking")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("FarmerMyContact")}
            >
              <Image
                source={require("../../../assets/images/Dashboard/contact.png")}
                style={styles.icon}
              />
              <Text style={styles.label}>{t("my_contact")}</Text>
            </TouchableOpacity>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t("logout")}</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)", // 🔥 soft glass effect
  },

  header: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000"
  },

  langButton: {
    backgroundColor: "#ADD8E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },

  langText: {
    fontSize: 14,
    fontWeight: "600"
  },

  /* ROW */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",

    // ✅ vertical spacing between rows
    marginBottom: 25,
      

  // ✅ perfect spacing between columns
  columnGap: 15,
  },

  /* BUTTON */
  button: {
    width: buttonSize,
    height: buttonSize,
    backgroundColor: "rgba(255,255,255,0.85)", // 🔥 glass style
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,

    // ✅ vertical spacing between buttons
    marginVertical: 5,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5
  },

  icon: {
    width: 60,
    height: 60,
    marginBottom: 10
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center"
  },

  logoutButton: {
    marginTop: 40,
    backgroundColor: "#ff4d4d",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  }
});