import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Alert, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import ProviderDashboard from "../screens/provider/ProviderDashboard";
import InventoryScreen from "../screens/provider/InventoryScreen";
import ProfileScreen from "../screens/common/ProfileScreen";

import { logoutUser } from "../firebase/authService";

const Tab = createBottomTabNavigator();

export default function ProviderTabNavigator() {

  const { t } = useTranslation();

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

          if (route.name === "Home") {
            icon = focused ? "home" : "home-outline";
          }

          else if (route.name === "Inventory") {
            icon = focused ? "cube" : "cube-outline";
          }

          else if (route.name === "Profile") {
            icon = focused ? "person" : "person-outline";
          }

          else if (route.name === "Logout") {
            icon = focused ? "log-out" : "log-out-outline";
          }

          return <Ionicons name={icon} size={size} color={color} />;
        },

        tabBarLabel: ({ focused, color }) => {

          let label = "";

          if (route.name === "Home") {
            label = t("home");
          }

          else if (route.name === "Inventory") {
            label = t("inventory");
          }

          else if (route.name === "Profile") {
            label = t("profile");
          }

          else if (route.name === "Logout") {
            label = t("logout");
          }

          else if (route.name === "AddMachine") {
            label = "";
          }

          return (
            <Text style={{ color: color, fontSize: 12 }}>
              {label}
            </Text>
          );
        },

        tabBarActiveTintColor: "#2e7d32",
        tabBarInactiveTintColor: "gray"
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
        name="AddMachine"
        component={ProviderDashboard}
        options={{
          tabBarLabel: "",
          tabBarIcon: () => (
            <View style={styles.fab}>
              <Ionicons name="add" size={30} color="white" />
            </View>
          )
        }}
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
          }
        })}
      />

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({

  tabBar: {
    height: 65,
    paddingBottom: 8
  },

  fab: {
    width: 60,
    height: 60,
    backgroundColor: "#2e7d32",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30
  }

});