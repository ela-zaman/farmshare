import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Alert, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Screens
import ProviderDashboard from "../screens/provider/ProviderDashboard";
import InventoryScreen from "../screens/provider/InventoryScreen";
import ProfileScreen from "../screens/common/ProfileScreen";

import AddMachineScreen from "../screens/provider/AddMachineScreen";
import ProviderNotificationScreen from "../screens/provider/ProviderNotificationScreen";
import ProviderBookingScreen from "../screens/provider/ProviderBookingScreen";
import ProviderCurrentStatus from "../screens/provider/ProviderCurrentStatus";
import ProviderMyContact from "../screens/provider/ProviderMyContact";

import ProviderMachineDetails from "../screens/provider/ProviderMachineDetails";
import ProviderEditMachine from "../screens/provider/ProviderEditMachine";
import ProviderProfileScreen from "../screens/provider/ProviderProfileScreen";

import { logoutUser } from "../firebase/authService";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ---------------- HOME STACK ---------------- */

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderDashboard" component={ProviderDashboard} />
      <Stack.Screen name="AddMachinery" component={AddMachineScreen} />
      <Stack.Screen name="ProviderNotification" component={ProviderNotificationScreen} />
      <Stack.Screen name="ProviderBookings" component={ProviderBookingScreen} />
      <Stack.Screen name="ProviderCurrentStatus" component={ProviderCurrentStatus} />
      <Stack.Screen name="ProviderMyContact" component={ProviderMyContact} />

      {/* ✅ Shared Screens */}
      <Stack.Screen name="ProviderMachineDetails" component={ProviderMachineDetails} />
      <Stack.Screen name="ProviderEditMachine" component={ProviderEditMachine} />
    </Stack.Navigator>
  );
}

/* ---------------- INVENTORY STACK ---------------- */

function InventoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InventoryMain" component={InventoryScreen} />

      {/* ✅ SAME shared screens */}
      <Stack.Screen name="ProviderMachineDetails" component={ProviderMachineDetails} />
      <Stack.Screen name="ProviderEditMachine" component={ProviderEditMachine} />
    </Stack.Navigator>
  );
}

/* ---------------- TAB NAVIGATOR ---------------- */

export default function ProviderTabNavigator() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  const toggleLanguage = () => {
    const newLang = language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  const handleLogout = async (navigation) => {
    try {
      await logoutUser();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }]
      });
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,

        tabBarIcon: ({ color, size, focused }) => {
          let icon;

          if (route.name === "Home") icon = focused ? "home" : "home-outline";
          else if (route.name === "Inventory") icon = focused ? "cube" : "cube-outline";
          else if (route.name === "ProviderProfileScreen") icon = focused ? "person" : "person-outline";
          else if (route.name === "Logout") icon = focused ? "log-out" : "log-out-outline";
          else if (route.name === "Language") icon = focused ? "language" : "language-outline";

          return <Ionicons name={icon} size={size} color={color} />;
        },

        tabBarLabel: ({ color }) => {
          let label = "";

          if (route.name === "Home") label = t("home");
          else if (route.name === "Inventory") label = t("inventory");
          else if (route.name === "ProviderProfileScreen") label = t("profile");
          else if (route.name === "Logout") label = t("logout");
          else if (route.name === "Language") label = language === "en" ? "বাংলা" : "English";

          return <Text style={{ color, fontSize: 12 }}>{label}</Text>;
        },

        tabBarActiveTintColor: "#2e7d32",
        tabBarInactiveTintColor: "gray"
      })}
    >

      {/* ✅ FIXED */}
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Inventory" component={InventoryStack} />
      <Tab.Screen name="ProviderProfileScreen" component={ProviderProfileScreen} />

      {/* Language */}
      <Tab.Screen
        name="Language"
        component={View}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            toggleLanguage();
          }
        })}
      />

      {/* Logout */}
      <Tab.Screen
        name="Logout"
        component={View}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            handleLogout(navigation);
          }
        })}
      />

    </Tab.Navigator>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    paddingBottom: 16,
    paddingTop: 8,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    backgroundColor: "#fff",
    borderTopWidth: 0,
    elevation: 5
  }
});