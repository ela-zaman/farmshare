import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  ImageBackground
} from "react-native";
import { useTranslation } from "react-i18next";

const screenWidth = Dimensions.get("window").width;
const buttonSize = (screenWidth / 2) - 30;

export default function ProviderDashboard({ navigation }) {

  const { t } = useTranslation();

  return (
    <ImageBackground
      source={require("../../../assets/images/background6.png")} // background image
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* CURRENT STATUS CARD */}
        <TouchableOpacity
          style={styles.statusCard}
          onPress={() => navigation.navigate("ProviderCurrentStatus")}
        >
          <Image
            source={require("../../../assets/images/Dashboard/Current Status.png")}
            style={styles.statusImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.statusTitle}>{t("current_status")}</Text>
            <Text style={styles.statusSubtitle}>
              {t("check_machine_availability")}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ROW 1 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("AddMachinery")}
          >
            <Image
              source={require("../../../assets/images/add.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.label}>{t("add_machinery")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ProviderNotification")}
          >
            <Image
              source={require("../../../assets/images/Dashboard/notify.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.label}>{t("notification")}</Text>
          </TouchableOpacity>
        </View>

        {/* ROW 2 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ProviderBookingScreen")}
          >
            <Image
              source={require("../../../assets/images/Dashboard/bookings.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.label}>{t("my_bookings")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ProviderMyContact")}
          >
            <Image
              source={require("../../../assets/images/Dashboard/contact.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.label}>{t("my_contact")}</Text>
          </TouchableOpacity>
        </View>

        {/* CARD BUTTON BELOW GRID */}
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate("ProviderBookingRequests")}
          >
            <Image
              source={require("../../../assets/Dashboard/inventory.jpg")}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardLabel}>{t("booking_requests")}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  background: {
    flex: 1
  },

  container: {
    padding: 15
  },

  /* STATUS CARD */
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ADD8E6",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4
  },

  statusImage: {
    width: 60,
    height: 60,
    marginRight: 20
  },

  statusTitle: {
    fontSize: 20,
    fontWeight: "700"
  },

  statusSubtitle: {
    fontSize: 14,
    color: "#333",
    marginTop: 4
  },

  /* GRID */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },

  button: {
    width: buttonSize,
    height: buttonSize,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center"
  },

  /* CARD BUTTON BELOW GRID */
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ADD8E6",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4
  },

  cardIcon: {
    width: 50,
    height: 50,
    marginRight: 15
  },

  cardLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000"
  }

});