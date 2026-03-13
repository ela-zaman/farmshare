// src/navigation/AppNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Farmer Screens
import FarmerDashboard from "../screens/farmer/FarmerDashboard";
import SearchScreen from "../screens/farmer/SearchScreen";
import MyBookingScreen from "../screens/farmer/MyBookingScreen";

// Provider Screens
import ProviderDashboard from "../screens/provider/ProviderDashboard";
import AddMachineScreen from "../screens/provider/AddMachineScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      {/* Auth */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      {/* Farmer */}
      <Stack.Screen name="FarmerDashboard" component={FarmerDashboard} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Booking" component={MyBookingScreen} />
      {/* Provider */}
      <Stack.Screen name="ProviderDashboard" component={ProviderDashboard} />
      <Stack.Screen name="AddMachine" component={AddMachineScreen} />
    </Stack.Navigator>
  );
}