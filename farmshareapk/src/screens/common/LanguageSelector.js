import React, { useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Dimensions
} from "react-native";
import { LanguageContext } from "../../context/LanguageContext";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

export default function LanguageSelector({ navigation }) {
  const { changeLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  // Floating animations for each button
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 10,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: -10,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const selectLanguage = async (lang) => {
    await changeLanguage(lang);
    navigation.replace("IntroSlider");
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/background5.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Top Text */}
      <View style={styles.textContainer}>
        <View style={styles.textBackground}>
          <Text style={styles.title}>{t("select_language")}</Text>
          <Text style={styles.subtitle}>আপনার ভাষা নির্বাচন করুন</Text>
        </View>
      </View>

      {/* Center Buttons */}
      <View style={styles.centerContainer}>
        <View style={styles.buttonWrapper}>
          <Animated.View style={{ transform: [{ translateY: floatAnim1 }] }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => selectLanguage("en")}
            >
              <Text style={styles.buttonText}>{t("english")}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: floatAnim2 }] }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => selectLanguage("bn")}
            >
              <Text style={styles.buttonText}>বাংলা</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },

  textContainer: {
    position: "absolute",
    top: 80,
    width: "100%",
    alignItems: "center",
  },

  textBackground: {
    backgroundColor: "#006400",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
  },

  // New center container
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.7,
  },

  button: {
    backgroundColor: "#006400",
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
});