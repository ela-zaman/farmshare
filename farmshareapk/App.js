import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';

export default function App() {
  const handlePress = () => {
    Alert.alert('Hello World', 'This is your test dashboard!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FarmShare Dashboard Test</Text>
      <Button title="Say Hello" onPress={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
});