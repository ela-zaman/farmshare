import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, Alert } from "react-native";


import { db, auth } from "../../firebase/firebaseConfig";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";


export default function AddMachineScreen() {

const [name, setName] = useState("");
const [machineType, setMachineType] = useState("");
const [chargeType, setChargeType] = useState("");






// UPLOAD IMAGE TO FIREBASE STORAGE



// ADD MACHINE TO FIRESTORE
const handleAddMachine = async () => {

  try {

    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    // FORM VALIDATION
    if (!name || !machineType || !chargeType) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

   
    // Upload image
  

    // Save machine data
    await addDoc(collection(db, "machines"), {

      name: name.trim(),
      machineType: machineType.trim(),
      chargeType: chargeType.trim(),
 

      providerId: user.uid,
      providerEmail: user.email,

      createdAt: serverTimestamp()

    });

    Alert.alert("Success", "Machine added successfully");

    // Reset form
    setName("");
    setMachineType("");
    setChargeType("");
    

  } catch (error) {

    console.log("Add Machine Error:", error);
    Alert.alert("Error", error.message);
    console.log("FULL ERROR:", error);
    console.log("ERROR CODE:", error.code);
    console.log("ERROR MESSAGE:", error.message);

  }

};


return (

<View style={{ padding: 20 }}>

<Text>Machine Name</Text>
<TextInput
  placeholder="Enter Machine Name"
  value={name}
  onChangeText={setName}
  style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
/>

<Text>Machine Type</Text>
<TextInput
  placeholder="Tractor / PowerTiller"
  value={machineType}
  onChangeText={setMachineType}
  style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
/>

<Text>Charge Type</Text>
<TextInput
  placeholder="Hourly / Daily"
  value={chargeType}
  onChangeText={setChargeType}
  style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
/>



<View style={{ marginTop: 20 }}>
<Button title="Add Machine" onPress={handleAddMachine} />
</View>

</View>

);

}