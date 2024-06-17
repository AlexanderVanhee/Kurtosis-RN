// RNumberInput.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  onRNumberEntered: (rnumber: string) => void;
}

const RNumberPrompt: React.FC<Props> = ({ onRNumberEntered }) => {
  const [rnumber, setRnumber] = useState('r');
  const colorScheme = useColorScheme();

  const handleRNumberChange = (text: string) => {
    if (text.length === 0 || text[0].toLowerCase() !== 'r') {
      setRnumber('r' + text.replace(/r/i, '')); 
    } else {
      setRnumber(text);
    }
  };

  const handleRNumberSubmit = async () => {
    try {
      await AsyncStorage.setItem('rnumber', rnumber); // Save to AsyncStorage
      onRNumberEntered(rnumber);
    } catch (error) {
      Alert.alert('Error', 'Failed to save R-number to AsyncStorage');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 50 }}>
        <Text style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}>
          Please enter your r-number, it is usually found at the back of your student card.
        </Text>
      </View>
      <TextInput
        style={[styles.input, { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }]}
        placeholder="Enter your R-number"
        value={rnumber}
        onChangeText={handleRNumberChange}
        keyboardType="numeric"
        autoCapitalize="none"
        maxLength={8}
      />
      <Button title="Submit" onPress={handleRNumberSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  input: {
    height: 40,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default RNumberPrompt;
