import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddMachineScreen() {
  const [name, setName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [tillageType, setTillageType] = useState("");
  const [tillageCharge, setTillageCharge] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [village, setVillage] = useState("");
  const [upazilla, setUpazilla] = useState("");
  const [district, setDistrict] = useState("");

  // Auto-fetch location for service area
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Enable location to auto-fetch service area");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync(location.coords);
      if (geocode.length > 0) {
        const place = geocode[0];
        setServiceArea(`${place.name}, ${place.street}, ${place.city}`);
      }
    })();
  }, []);

  const handleAddMachine = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      // Form validation
      if (!name || !machineType || !tillageType || !tillageCharge || !village || !upazilla || !district) {
        Alert.alert("Error", "Please fill all fields");
        return;
      }

      await addDoc(collection(db, "machines"), {
        name: name.trim(),
        machineType: machineType.trim(),
        tillageType: tillageType.trim(),
        tillageCharge: tillageCharge.trim(),
        serviceArea: serviceArea,
        village: village.trim(),
        upazilla: upazilla.trim(),
        district: district.trim(),
        providerId: user.uid,
        providerEmail: user.email,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Machine added successfully");

      // Reset form
      setName("");
      setMachineType("");
      setTillageType("");
      setTillageCharge("");
      setVillage("");
      setUpazilla("");
      setDistrict("");
      setServiceArea("");

    } catch (error) {
      console.log("Add Machine Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Add Farm Machinery</Text>

        {/* Machinery Name */}
        <Text style={styles.label}>Farm Machinery Name</Text>
        <TextInput
          placeholder="Enter Machine Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Machinery Type */}
        <Text style={styles.label}>Machinery Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={machineType}
            onValueChange={(itemValue) => setMachineType(itemValue)}
          >
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

        {/* Tillage Charge Type */}
        <Text style={styles.label}>Tillage Charge Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tillageType}
            onValueChange={(itemValue) => setTillageType(itemValue)}
          >
            <Picker.Item label="Select Tillage Charge Type" value="" />
            <Picker.Item label="Per Decimal" value="Per Decimal" />
            <Picker.Item label="Per Bigha" value="Per Bigha" />
          </Picker>
        </View>

        {/* Tillage Charge */}
        <Text style={styles.label}>Tillage Charge</Text>
        <TextInput
          placeholder="Enter Tillage Charge"
          value={tillageCharge}
          onChangeText={setTillageCharge}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Service Area */}
        <Text style={styles.label}>Service Area</Text>
        <TextInput
          value={serviceArea}
          editable={false}
          style={[styles.input, { backgroundColor: "#eee" }]}
        />

        {/* Village */}
        <Text style={styles.label}>Village</Text>
        <TextInput
          placeholder="Enter Village"
          value={village}
          onChangeText={setVillage}
          style={styles.input}
        />

        {/* Upazilla */}
        <Text style={styles.label}>Upazilla</Text>
        <TextInput
          placeholder="Enter Upazilla"
          value={upazilla}
          onChangeText={setUpazilla}
          style={styles.input}
        />

        {/* District */}
        <Text style={styles.label}>District</Text>
        <TextInput
          placeholder="Enter District"
          value={district}
          onChangeText={setDistrict}
          style={styles.input}
        />

        {/* Add Machinery Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddMachine}>
          <Text style={styles.addButtonText}>Add Machinery</Text>
        </TouchableOpacity>

        {/* Extra padding so button is fully visible */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});