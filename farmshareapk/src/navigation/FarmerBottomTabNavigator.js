import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Alert, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Screens
import FarmerDashboard from "../screens/farmer/FarmerDashboard";
import MyLandScreen from "../screens/farmer/FarmerLandInfo";
import ProviderProfileScreen from "../screens/provider/ProviderProfileScreen";
import MyBookingScreen from "../screens/farmer/MyBookingScreen";



import { logoutUser } from "../firebase/authService";
import SearchScreen from "../screens/farmer/SearchScreen";
import BookedMachine from "../screens/farmer/BookedMachine";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ---------------- HOME STACK ---------------- */

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FarmerDashboard" component={FarmerDashboard} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="MyBookingScreen" component={MyBookingScreen} />
      <Stack.Screen name="BookedMachine" component={BookedMachine} />
      
    </Stack.Navigator>
  );
}

/* ---------------- MY LAND STACK ---------------- */

function LandStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyLandMain" component={MyLandScreen} />
      
      
    </Stack.Navigator>
  );
}

/* ---------------- TAB NAVIGATOR ---------------- */

export default function FarmerBottomTabNavigator() {
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

          if (route.name === "Home")
            icon = focused ? "home" : "home-outline";
          else if (route.name === "MyLand")
            icon = focused ? "leaf" : "leaf-outline";
          else if (route.name === "Profile")
            icon = focused ? "person" : "person-outline";
          else if (route.name === "Logout")
            icon = focused ? "log-out" : "log-out-outline";
          else if (route.name === "Language")
            icon = focused ? "language" : "language-outline";

          return <Ionicons name={icon} size={size} color={color} />;
        },

        tabBarLabel: ({ color }) => {
          let label = "";

          if (route.name === "Home") label = t("home");
          else if (route.name === "MyLand") label = t("my_land");
          else if (route.name === "Profile") label = t("profile");
          else if (route.name === "Logout") label = t("logout");
          else if (route.name === "Language")
            label = language === "en" ? "বাংলা" : "English";

          return <Text style={{ color, fontSize: 12 }}>{label}</Text>;
        },

        tabBarActiveTintColor: "#2e7d32",
        tabBarInactiveTintColor: "gray"
      })}
    >
      {/* ✅ FIXED STRUCTURE */}
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="MyLand" component={LandStack} />
      <Tab.Screen name="Profile" component={ProviderProfileScreen} />

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