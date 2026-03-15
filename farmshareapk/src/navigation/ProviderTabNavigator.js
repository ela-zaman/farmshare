import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ProviderDashboard from "../screens/provider/ProviderDashboard";
import InventoryScreen from "../screens/provider/InventoryScreen";
import ProfileScreen from "../screens/common/ProfileScreen";

import { logoutUser } from "../firebase/authService";

const Tab = createBottomTabNavigator();

export default function ProviderTabNavigator() {

  const handleLogout = async (navigation) => {
    try {
      await logoutUser();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ focused, color, size }) => {

          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          }

          else if (route.name === "Inventory") {
            iconName = focused ? "cube" : "cube-outline";
          }

          else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          else if (route.name === "Logout") {
            iconName = focused ? "log-out" : "log-out-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        tabBarActiveTintColor: "#2e7d32",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Home"
        component={ProviderDashboard}
      />

      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />

      <Tab.Screen
        name="Logout"
        component={ProviderDashboard}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            handleLogout(navigation);
          },
        })}
      />

    </Tab.Navigator>
  );
}