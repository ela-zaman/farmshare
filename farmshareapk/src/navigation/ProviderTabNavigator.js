import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";

import ProviderDashboard from "../screens/provider/ProviderDashboard";
import InventoryScreen from "../screens/provider/MachineInventoryScreen";
import ProfileScreen from "../screens/common/ProfileScreen";
import LogoutScreen from "../screens/auth/LogoutScreen.js";

const Tab = createBottomTabNavigator();

export default function ProviderTabNavigator() {

  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0214a3",
        tabBarInactiveTintColor: "gray",

        tabBarIcon: ({ color, size }) => {

          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Inventory") iconName = "cube";
          else if (route.name === "Logout") iconName = "log-out";
          else if (route.name === "Profile") iconName = "person";

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >

      <Tab.Screen
        name="Home"
        component={ProviderDashboard}
        options={{ title: t("home") }}
      />

      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ title: t("inventory") }}
      />

      <Tab.Screen
        name="Logout"
        component={LogoutScreen}
        options={{ title: t("logout") }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t("profile") }}
      />

    </Tab.Navigator>
  );
}