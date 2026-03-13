import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const slides = [
  {
    key: 'one',
    title: 'Welcome to FarmShare',
    text: 'Rent or share farm machinery easily.',
    image: require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/splashScreen/slide1.png'),
    backgroundColor: '#febe29',
  },
  {
    key: 'two',
    title: 'Find Machinery Nearby',
    text: 'Search for available equipment in your area.',
    image: require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/splashScreen/slide2.png'),
    backgroundColor: '#22bcb5',
  },
  {
    key: 'three',
    title: 'Grow Your Harvest',
    text: 'Manage rentals and harvest efficiently.',
    image: require('G:/Farm-Share Ap/farmshare/farmshareapk/assets/splashScreen/slide3.png'),
    backgroundColor: '#3395ff',
  },
];

const IntroSlider = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  const onDone = async () => {
    try {
      await AsyncStorage.setItem('hasSeenIntro', 'true'); // mark intro as seen
      navigation.replace('Login');
    } catch (error) {
      console.log(error);
      navigation.replace('Login');
    }
  };

  const renderNextButton = () => (
    <View style={styles.buttonCircle}>
      <Text style={styles.buttonText}>Next</Text>
    </View>
  );

  const renderDoneButton = () => (
    <TouchableOpacity style={styles.buttonCircle} onPress={onDone}>
      <Text style={styles.buttonText}>Get Started</Text>
    </TouchableOpacity>
  );

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      onDone={onDone}
      showSkipButton
      onSkip={onDone}
      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      activeDotStyle={{ backgroundColor: '#fff', width: 20 }}
      onSlideChange={(index) => setActiveIndex(index)}
    />
  );
};

const styles = StyleSheet.create({
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  image: { width: 200, height: 200, marginBottom: 30, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
  text: { fontSize: 16, color: '#fff', textAlign: 'center' },
  buttonCircle: {
    width: 120,
    height: 40,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default IntroSlider;