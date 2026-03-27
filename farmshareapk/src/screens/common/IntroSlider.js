import React, { useEffect, useState } from "react"; 
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

export default function IntroSlider({ navigation }) {

  const { t } = useTranslation();

  const slides = [
    {
      image: require("../../../assets/images/introslider/intro1_.jpeg"),
      textKey: "rent_machine",
    },
    {
      image: require("../../../assets/images/introslider/intro2.jpeg"),
      textKey: "earn_machine",
    },
    {
      image: require("../../../assets/images/introslider/intro3.jpeg"),
      textKey: "maximize_farm",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev === slides.length - 1) return prev;
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, slides.length * 2500);

    return () => clearTimeout(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <ImageBackground
      source={require("../../../assets/images/background4.png")}
      style={styles.container}
      resizeMode="cover"
    >

      {/* IMAGE (TOP) */}
      <View style={styles.imageWrapper}>
        <Image
          source={slide.image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* TEXT (BOTTOM WITH DARK GREEN BACKGROUND) */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          {t(slide.textKey)}
        </Text>
      </View>

    </ImageBackground>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },

  imageWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 30,
  },

  image: {
    width: width,
    height: height * 0.6,
  },

  textContainer: {
    position: "absolute",
    bottom: 80, // slightly above bottom
    left: 20,
    right: 20,
    backgroundColor: "#006400", // dark green background
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },

  text: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
});