import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet
} from "react-native";

import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { db, auth } from "../../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function InventoryScreen() {
  const [machines, setMachines] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      console.log("User not logged in");
      return;
    }

    // 🔥 Query only current user's machines
    const q = query(
      collection(db, "machines"),
      where("providerId", "==", user.uid)
    );

    // 🔥 Real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const machineList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setMachines(machineList);
      },
      (error) => {
        console.log("Realtime error:", error);
      }
    );

    // Cleanup listener when leaving screen
    return () => unsubscribe();
  }, []);

  // 🔥 Dynamic Image Logic
  const getMachineImage = (name) => {
    if (name?.toLowerCase() === "tractor") {
      return require("../../../assets/images/add.png"); // use tractor image if available
    }
    return require("../../../assets/images/add.png"); // default image
  };

  return (
    <ScrollView style={styles.container}>
      {machines.length === 0 ? (
        <Text style={styles.emptyText}>
          No machines added yet
        </Text>
      ) : (
        machines.map((machine) => (
          <TouchableOpacity
            key={machine.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("MachineDetails", {
                machineId: machine.id
              })
            }
          >
            {/* Image */}
            <Image
              source={getMachineImage(machine.name)}
              style={styles.image}
            />

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.name}>
                {machine.name}
              </Text>

              <Text style={styles.chargeType}>
                Type: {machine.tillageType}
              </Text>

              <Text style={styles.chargeInfo}>
                Charge: {machine.tillageCharge}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

/* --------------------------- */
/* Styles                      */
/* --------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777"
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d0e6ff", // soft blue
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2 // slight shadow (Android)
  },

  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2
  },

  chargeType: {
    fontSize: 14,
    color: "#444",
  },

  chargeInfo: {
    fontSize: 14,
    color: "#444",
  },
});