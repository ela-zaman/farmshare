// IntroSlider.js
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const IntroSlider = ({ navigation }) => {
  return (
    <Onboarding
      onDone={() => navigation.replace('Login')} // navigate to Login screen
      onSkip={() => navigation.replace('Login')} // skip button behavior
      pages={[
        {
          backgroundColor: '#0214a3',
          image: <Image source={require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/introslider/intro1.png')} style={styles.image} />,
          title: 'Rent',
          subtitle: 'Rent farm machinery easily',
        },
        {
          backgroundColor: '#0214a3',
          image: <Image source={require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/introslider/intro2.png')} style={styles.image} />,
          title: 'Earn',
          subtitle: 'Earn by sharing your machinery',
        },
        {
          backgroundColor: '#0214a3',
          image: <Image source={require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/images/introslider/intro1.png')} style={styles.image} />,
          title: 'Harvest',
          subtitle: 'Maximize your farm production',
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
});

export default IntroSlider;