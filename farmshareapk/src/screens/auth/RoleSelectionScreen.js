import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Animated,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

export default function RoleSelectionScreen({ navigation }) {
  const { t } = useTranslation();

  // Floating animations
  const floatFarmer = useRef(new Animated.Value(0)).current;
  const floatProvider = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatFarmer, {
          toValue: -15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(floatFarmer, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatProvider, {
          toValue: 15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(floatProvider, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const selectRole = (role) => {
    navigation.navigate("Register", { role });
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/background6.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t("select_role")}</Text>
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        {/* Farmer Button */}
        <Animated.View style={{ transform: [{ translateY: floatFarmer }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => selectRole("farmer")}
          >
            <Image
              source={require("../../../assets/images/farmer.png")}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>{t("farmer")}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Provider Button */}
        <Animated.View style={{ transform: [{ translateY: floatProvider }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => selectRole("provider")}
          >
            <Image
              source={require("../../../assets/images/provider.png")}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>{t("provider")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },

  // Full width dark green title
  titleContainer: {
    width: "100%",
    backgroundColor: "darkgreen",
    paddingVertical: 12,
    marginBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },

  button: {
    alignItems: "center",
    backgroundColor: "darkgreen",
    padding: 10,
    borderRadius: 12,
    width: width * 0.35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  buttonImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
    resizeMode: "contain",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});