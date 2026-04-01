import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function EditMachineScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { machine } = route.params;

  const [name, setName] = useState(machine.name);
  const [machineType, setMachineType] = useState(machine.machineType);
  const [tillageType, setTillageType] = useState(machine.tillageType);
  const [chargePerBigha, setChargePerBigha] = useState(machine.chargePerBigha);
  const [chargePerDecimal, setChargePerDecimal] = useState(machine.chargePerDecimal);
  const [village, setVillage] = useState(machine.village);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "machines", machine.id);

      await updateDoc(docRef, {
        name,
        machineType,
        chargePerBigha,
        chargePerDecimal,
        village,
      });

      Alert.alert("Success", "Machine updated successfully");

      navigation.goBack(); // 🔙 back to details (auto updates)

    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.label}>Machine Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Machine Type</Text>
      <Picker
        selectedValue={machineType}
        onValueChange={setMachineType}
      >
        <Picker.Item label="Tractor" value="Tractor" />
        <Picker.Item label="Powertiller" value="Powertiller" />
        <Picker.Item label="Reaper" value="Reaper" />
        <Picker.Item label="Bed Planter" value="Bed Planter" />
        <Picker.Item label="Combine Harvester" value="Combine Harvester" />
        <Picker.Item label="Thresher" value="Thresher" />
        <Picker.Item label="Sprayer" value="Sprayer" />
      </Picker>

     

      <Text style={styles.label}>Tillage Charge Per Bigha</Text>
      <TextInput
        value={chargePerBigha}
        onChangeText={setChargePerBigha}
        keyboardType="numeric"
        style={styles.input}
      />
<Text style={styles.label}>Tillage Charge Per Decimal</Text>
      <TextInput
        value={chargePerDecimal}
        onChangeText={setChargePerDecimal}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Village</Text>
      <TextInput
        value={village}
        onChangeText={setVillage}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdate}
      >
        <Text style={styles.buttonText}>
          Update Machine
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  label: {
    marginTop: 10,
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});