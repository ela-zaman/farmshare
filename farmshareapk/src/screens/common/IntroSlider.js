import React from 'react';
import { Dimensions, Image, StyleSheet, View, Text } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    image: require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/introslider/intro1_1.png'),
    text: 'Rent Farm Machinery',
  },
  {
    image: require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/introslider/intro2.png'),
    text: 'Earn by sharing your machinery',
  },
  {
    image: require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/introslider/intro3.png'),
    text: 'Maximize your farm production',
  },
];

const IntroSlider = ({ navigation }) => {
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
            <Text style={styles.text}>{slide.text}</Text>
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
    width: width * .8,
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