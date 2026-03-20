import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from '../screens/common/SplashScreen';
import LanguageSelector from "../screens/common/LanguageSelector";
import IntroSlider from '../screens/common/IntroSlider';
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import RoleSelectionScreen from "../screens/auth/RoleSelectionScreen";

// Farmer Screens
import FarmerDashboard from "../screens/farmer/FarmerDashboard";
import SearchScreen from "../screens/farmer/SearchScreen";
import MyBookingScreen from "../screens/farmer/MyBookingScreen";

// Provider Screens
import ProviderTabNavigator from "../navigation/ProviderTabNavigator";
import AddMachineScreen from "../screens/provider/AddMachineScreen";
import ProviderNotificationScreen from "../screens/provider/ProviderNotificationScreen";
import ProviderBookingScreen from "../screens/provider/ProviderBookingScreen";
import ProviderCurrentStatus from "../screens/provider/ProviderCurrentStatus"
import ProviderMyContact  from "../screens/provider/ProviderMyContact";
import ProviderMachineDetails from "../screens/provider/ProviderMachineDetails";
import ProviderEditMachine from "../screens/provider/ProviderEditMachine";
import ProviderBookingRequests from "../screens/provider/ProviderBookingRequests";
import SearchResult from "../screens/farmer/SearchResult";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    
    <Stack.Navigator initialRouteName="Splash">

      <Stack.Screen
    name="Splash"
    component={SplashScreen}
    options={{headerShown:false}}
  />

{/* Language Selection */}
      <Stack.Screen
        name="LanguageSelector"
        component={LanguageSelector}
      />
  
      {/* Auth Flow */}
     
     <Stack.Screen name="IntroSlider" component={IntroSlider} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />

      {/* Farmer */}
      <Stack.Screen name="FarmerDashboard" component={FarmerDashboard} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Booking" component={MyBookingScreen} />

      {/* Provider */}
      <Stack.Screen
        name="ProviderDashboard"
        component={ProviderTabNavigator}
      />
      <Stack.Screen name="ProviderCurrentStatus" component={ProviderCurrentStatus} />
      <Stack.Screen name="AddMachinery" component={AddMachineScreen} />
      <Stack.Screen name="ProviderNotification" component={ProviderNotificationScreen} />
      <Stack.Screen name="ProviderBookings" component={ProviderBookingScreen} />
      <Stack.Screen name="ProviderMyContact" component={ProviderMyContact} />
      <Stack.Screen name="ProviderMachineDetails" component={ProviderMachineDetails} />
      <Stack.Screen name="ProviderEditMachine" component={ProviderEditMachine} />
     <Stack.Screen name="ProviderBookingRequests" component={ProviderBookingRequests} />
  <Stack.Screen name="SearchScreen" component={SearchScreen} />
   <Stack.Screen name="SearchResult" component={SearchResult} />
    </Stack.Navigator>
  );
}