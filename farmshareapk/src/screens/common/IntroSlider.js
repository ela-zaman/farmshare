import React from 'react';
import { Dimensions, Image, StyleSheet, View, Text } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get('window');

const IntroSlider = ({ navigation }) => {

  const { t } = useTranslation();

  // Slides with translation keys
  const slides = [
    {
      image: require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/introslider/intro1_.jpeg'),
      textKey: 'rent_machine',
    },
    {
      image: require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/introslider/intro2.jpeg'),
      textKey: 'earn_machine',
    },
    {
      image: require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/introslider/intro3.jpeg'),
      textKey: 'maximize_farm',
    },
  ];

  return (
    <Onboarding
      onDone={() => navigation.replace('Login')}
      onSkip={() => navigation.replace('Login')}
      showNext={true}
      showSkip={true}
      pages={slides.map((slide) => ({
        backgroundColor: '#0214a3',
        image: (
          <View style={styles.slideContainer}>
            <Image source={slide.image} style={styles.image} />
            <Text style={styles.text}>{t(slide.textKey)}</Text>
          </View>
        ),
        title: '',       // empty so default title doesn't appear
        subtitle: '',    // empty so default subtitle doesn't appear
      }))}
    />
  );
};

const styles = StyleSheet.create({
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    height: height * 0.7, // 70% of screen height for image + text
  },
  image: {
    width: width * 0.8,
    height: height * 0.5,
    resizeMode: 'contain',
  },
  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default IntroSlider;