import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function FarmerDashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farmer Dashboard</Text>

      <Button
        title="Search Machines"
        onPress={() => navigation.navigate("Search")}
      />

      <Button
        title="My Bookings"
        onPress={() => navigation.navigate("Booking")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});