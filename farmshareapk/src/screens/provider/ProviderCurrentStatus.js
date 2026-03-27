import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet
} from "react-native";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function ProviderCurrentStatus() {
  const [machines, setMachines] = useState([]);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  // Fetch Machines
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "machines"), where("providerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const machineList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setMachines(machineList);
    });

    return () => unsubscribe();
  }, []);

  // Get local image for machine type
  const getMachineImage = (machineType) => {
    if (!machineType) return require("../../../assets/images/add.png");
    const type = machineType.toLowerCase();
    switch (type) {
      case "tractor":
        return require("../../../assets/images/Machines/tractor.png");
      case "powertiller":
        return require("../../../assets/images/Machines/powertiller.png");
      case "reaper":
        return require("../../../assets/images/Machines/reaper.png");
      case "sprayer":
        return require("../../../assets/images/Machines/sprayer.jpg");
      case "thresher":
        return require("../../../assets/images/Machines/thresher.png");
      case "combine harvester":
        return require("../../../assets/images/Machines/combine harvester.png");
      case "bed planter":
        return require("../../../assets/images/Machines/bed planter.png");
      default:
        return require("../../../assets/images/add.png");
    }
  };

  // Translate machine type
  const getMachineTypeLabel = (type) => {
    if (!type) return "";
    const key = type.toLowerCase().replace(/\s/g, "_");
    return t(key);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {machines.length === 0 ? (
        <Text style={styles.emptyText}>{t("no_machines")}</Text>
      ) : (
        machines.map((machine) => (
          <TouchableOpacity
            key={machine.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("MachineStatus", { machineId: machine.id, machineType:machine.machineType})
            }
          >
            {/* Machine Image */}
            <Image source={getMachineImage(machine.machineType)} style={styles.image} />

            {/* Machine Type */}
            <View style={styles.info}>
              <Text style={styles.machineType}>
                {getMachineTypeLabel(machine.machineType)}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

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
    color: "#777",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d0e6ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
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
  machineType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
});