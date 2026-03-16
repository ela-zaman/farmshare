import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";

const screenWidth = Dimensions.get("window").width;
const buttonSize = (screenWidth / 2) - 30; // size for square grid buttons

export default function ProviderDashboard({ navigation }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Full-width Current Status Button */}
      <TouchableOpacity 
        style={styles.fullButton} 
        onPress={() =>  navigation.navigate("ProviderCurrentStatus")}
      >
        <Image 
          source={require("../../../assets/images/add.png")} 
          style={styles.fullButtonImage} 
          resizeMode="contain" 
        />
        <Text style={styles.fullButtonText}>{t("current_status")}</Text>
      </TouchableOpacity>

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

        <TouchableOpacity style={styles.button}onPress={() => navigation.navigate("ProviderMyContact")}>
          <Image source={require("../../../assets/images/add.png")} style={styles.icon} resizeMode="contain" />
          <Text style={styles.label}>{t("my_contact")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
    justifyContent: "flex-start"
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
  },
  fullButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ADD8E6", // soft blue
    borderRadius: 10,
    height: buttonSize,
    marginBottom: 20,
    paddingHorizontal: 15
  },
  fullButtonImage: {
    width: buttonSize * 0.6,
    height: "80%",
    marginRight: 15
  },
  fullButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000"
  }
});