import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";

const screenWidth = Dimensions.get("window").width;
const buttonSize = (screenWidth / 2) - 30; // two buttons per row

export default function ProfileDashboard({ navigation }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("AddMachinery")}>
          <Image source={require("../../../assets/images/add.png")} style={styles.icon} resizeMode="contain" />
          <Text style={styles.label}>{t("add_machinery")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ProviderNotification")}>
          <Image source={require("../../../assets/images/add.png")} style={styles.icon} resizeMode="contain" />
          <Text style={styles.label}>{t("notification")}</Text>
        </TouchableOpacity>
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ProviderBookings")}>
          <Image source={require("../../../assets/images/add.png")} style={styles.icon} resizeMode="contain" />
          <Text style={styles.label}>{t("my_bookings")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => alert("Fourth Button clicked")}>
          <Image source={require("../../../assets/images/add.png")} style={styles.icon} resizeMode="contain" />
          <Text style={styles.label}>{t("fourth_button")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15
  },
  button: {
    width: buttonSize,
    height: buttonSize,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 10
  },
  icon: {
    width: "50%",
    height: "50%",
    marginBottom: 10
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center"
  }
});