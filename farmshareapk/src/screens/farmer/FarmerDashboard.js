import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Alert
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

  // Language toggle function
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: "center" }}>

      {/* HEADER WITH LANGUAGE SWITCH */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("farmer_dashboard")}</Text>

        <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
          <Text style={styles.langText}>
            {i18n.language === "en" ? "BN" : "EN"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* GRID ROW 1 */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("SearchScreen")}
        >
          <Image
            source={require("../../../assets/images/Dashboard/search.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.label}>{t("search")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("NewOrder")}
        >
          <Image
            source={require("../../../assets/images/Dashboard/contact.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.label}>{t("new_order")}</Text>
        </TouchableOpacity>
      </View>

      {/* GRID ROW 2 */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Image
            source={require("../../../assets/images/Dashboard/contact.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.label}>{t("notifications")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Profile")}
        >
          <Image
            source={require("../../../assets/images/Dashboard/contact.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.label}>{t("profile")}</Text>
        </TouchableOpacity>
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t("logout")}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30
  },

  /* HEADER */
  header: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },

  title: {
    fontSize: 24,
    fontWeight: "700"
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

  /* GRID */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "90%"
  },

  button: {
    width: buttonSize,
    height: buttonSize,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3
  },

  icon: {
    width: 60,
    height: 60,
    marginBottom: 10
  },

  label: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center"
  },

  /* LOGOUT */
  logoutButton: {
    marginTop: 30,
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