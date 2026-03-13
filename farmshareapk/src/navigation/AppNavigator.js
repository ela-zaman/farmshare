import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import RoleSelectionScreen from "../screens/auth/RoleSelectionScreen";

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
      {/* Auth Flow */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />

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