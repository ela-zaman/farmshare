import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
} from "react-native";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function ProviderMachineDetails() {
  const [machine, setMachine] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  const { machineId } = route.params;

  useEffect(() => {
    const docRef = doc(db, "machines", machineId);

    // 🔥 REAL-TIME LISTENER
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setMachine({
            id: docSnap.id,
            ...docSnap.data()
          });
        }
      },
      (error) => {
        console.log("Realtime error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const getImage = (machineType) => {
    if (machineType?.toLowerCase() === "tractor") {
      return require("../../../assets/images/Machines/tractor.png");

    }
     if (machineType?.toLowerCase() === "powertiller") {
      return require("../../../assets/images/Machines/powertiller.png");
      
    }
     if (machineType?.toLowerCase() === "reaper") {
      return require("../../../assets/images/Machines/reaper.png");
      
    }
     if (machineType?.toLowerCase() === "sprayer") {
      return require("../../../assets/images/Machines/sprayer.jpg");
      
    }
     if (machineType?.toLowerCase() === "thresher") {
      return require("../../../assets/images/Machines/thresher.png");
      
    }
     if (machineType?.toLowerCase() === "combine harvester") {
      return require("../../../assets/images/Machines/combine harvester.png");
      
    }

    
    
  };

  if (!machine) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* 🔵 Circle Image */}
      <Image
        source={getImage(machine.machineType)}
        style={styles.image}
      />

      {/* 🔥 Machine Info */}
      <Text style={styles.name}>{machine.machineType}</Text>

      <Text style={styles.info}>
        Type: {machine.machineType}
      </Text>

      <Text style={styles.info}>
        Tillage Type: {machine.tillageType}
      </Text>

      <Text style={styles.info}>
        Charge: {machine.tillageCharge}
      </Text>

      <Text style={styles.info}>
        Village: {machine.village}
      </Text>

      {/* ✏️ Edit Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("ProviderEditMachine", {
            machine: machine
          })
        }
      >
        <Text style={styles.buttonText}>
          Edit Details
        </Text>
      </TouchableOpacity>

    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  info: {
    fontSize: 16,
    marginBottom: 5,
  },

  button: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 25,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});