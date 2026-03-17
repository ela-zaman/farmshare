import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import { db, auth, storage } from "../../firebase/firebaseConfig";

import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { bdLocations } from "../../data/bdLocation";

export default function AddMachineScreen() {

  const [name, setName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [tillageType, setTillageType] = useState("");
  const [tillageCharge, setTillageCharge] = useState("");

  const [district, setDistrict] = useState("");
  const [upazilla, setUpazilla] = useState("");
  const [village, setVillage] = useState("");

  const scrollViewRef = useRef(null);
  const districts = Object.keys(bdLocations);
  const upazillas = district ? bdLocations[district] : [];

  const handleAddMachine = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      if (!name || !machineType || !tillageType || !tillageCharge || !district || !upazilla || !village) {
        Alert.alert("Error", "Please fill all fields");
        return;
      }

      await addDoc(collection(db, "machines"), {
        name: name.trim(),
        machineType,
        tillageType,
        tillageCharge,
        district,
        upazilla,
        village,
        providerId: user.uid,
        providerEmail: user.email,
        createdAt: serverTimestamp()
      });

      Alert.alert("Success", "Machine added successfully");

      setName(""); setMachineType(""); setTillageType("");
      setTillageCharge(""); setDistrict(""); setUpazilla(""); setVillage("");

    } catch (error) {
      console.log("Add Machine Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with small image */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Add Farm Machinery</Text>
          <Image
            source={require("../../../assets/images/add.png")} // Replace with your small image
            style={styles.headerImage}
          />
        </View>

        {/* Machine Name */}
        <Text style={styles.label}>Farm Machinery Name</Text>
        <TextInput
          placeholder="Enter Machine Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Machine Type */}
        <Text style={styles.label}>Machinery Type</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={machineType} onValueChange={setMachineType}>
            <Picker.Item label="Select Machine Type" value="" />
            <Picker.Item label="Tractor" value="Tractor" />
            <Picker.Item label="Powertiller" value="Powertiller" />
            <Picker.Item label="Reaper" value="Reaper" />
            <Picker.Item label="Bed Planter" value="Bed Planter" />
            <Picker.Item label="Combine Harvester" value="Combine Harvester" />
            <Picker.Item label="Thresher" value="Thresher" />
            <Picker.Item label="Sprayer" value="Sprayer" />
          </Picker>
        </View>

        {/* Charge Type */}
        <Text style={styles.label}>Tillage Charge Type</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={tillageType} onValueChange={setTillageType}>
            <Picker.Item label="Select Charge Type" value="" />
            <Picker.Item label="Per Decimal" value="Per Decimal" />
            <Picker.Item label="Per Bigha" value="Per Bigha" />
          </Picker>
        </View>

        {/* Charge */}
        <Text style={styles.label}>Tillage Charge</Text>
        <TextInput
          placeholder="Enter Charge"
          value={tillageCharge}
          onChangeText={setTillageCharge}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* District */}
        <Text style={styles.label}>District</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={district}
            onValueChange={(value) => { setDistrict(value); setUpazilla(""); }}
          >
            <Picker.Item label="Select District" value="" />
            {districts.map((d) => <Picker.Item key={d} label={d} value={d} />)}
          </Picker>
        </View>

        {/* Upazila */}
        <Text style={styles.label}>Upazila</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={upazilla} onValueChange={setUpazilla}>
            <Picker.Item label="Select Upazila" value="" />
            {upazillas.map((u) => <Picker.Item key={u} label={u} value={u} />)}
          </Picker>
        </View>

        {/* Village */}
        <Text style={styles.label}>Village</Text>
        <TextInput
          placeholder="Enter Village"
          value={village}
          onChangeText={setVillage}
          style={styles.input}
        />

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddMachine}>
          <Text style={styles.addButtonText}>Add Machinery</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* --------------------------- */
/* Styles                      */
/* --------------------------- */
const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginRight: 10 },
  headerImage: { width: 24, height: 24, resizeMode: "contain" },
  label: { fontWeight: "bold", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10 },
  addButton: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 30, alignItems: "center", marginTop: 20 },
  addButtonText: { color: "#fff", fontWeight: "bold" }
});