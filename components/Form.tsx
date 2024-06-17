import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, useColorScheme } from 'react-native';
import { Card, Text } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';



interface FormProps {
  onSubmit: (formData: FormData) => void; // Define the onSubmit prop as a function that takes FormData and returns void
}

interface FormData {
  selectedLibrary: string;
  date: string;
}

const Form: React.FC<FormProps> = ({ onSubmit }) => {
  const colorScheme = useColorScheme(); 
  
 
  const [selectedLibrary, setSelectedLibrary] = useState('');
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const handleFormSubmit = () => {
    
    const formData = {

      selectedLibrary: selectedLibrary,
      date: date.toISOString(), 
    };
    onSubmit(formData);
  };

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 9);

  return (
    <View style={[styles.container]}>
      <Card containerStyle={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#212121' : '#f0f0f0' }]}>
        <Text style={[styles.cardTitle, { color: colorScheme === 'dark' ? '#ffffff' : '#000' }]}>Kurtosis</Text>

        <Picker
          selectedValue={selectedLibrary}
          style={[styles.picker, { backgroundColor: colorScheme === 'dark' ? '#333' : '#eee', color: colorScheme === 'dark' ? '#fff' : '#000' }]}
          onValueChange={(itemValue) => setSelectedLibrary(itemValue)}
        >
          <Picker.Item label="Silent Study" value="agora" />
          <Picker.Item label="Seats in rooms (Only during blokperiode)" value="agora-blok-rooms" />
          <Picker.Item label="FlexiSpace (Only during blokperiode)" value="agora-flexispace" />
          <Picker.Item label="Meeting rooms (Not during blokperiode)" value="agora-rooms" />
          <Picker.Item label="Boekenzaal/Leeszaal/DeLeVille" value="arenberg-main" />
          <Picker.Item label="Kelder/Zolder" value="arenberg-rest" />
          <Picker.Item label="Tulp 0/1" value="arenberg-tulp" />
          <Picker.Item label="EBIB" value="ebib" />
          <Picker.Item label="Artes Erasmushuis" value="erasmus" />
          <Picker.Item label="Kulak" value="kulak" />
        </Picker>

        <View style={styles.buttonContainer}>
          <Button title="Choose Date" onPress={() => setOpen(true)} />
        </View>

        <DatePicker
          modal
          open={open}
          date={date}
          mode="date"
          minimumDate={new Date()}
          maximumDate={maxDate}
          onConfirm={(pickedDate) => {
            setOpen(false);
            setDate(pickedDate);
          }}
          onCancel={() => setOpen(false)}
        />

        <Button title="Submit" onPress={handleFormSubmit} />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor:'transparent',
  },
  card: {
    width: '95%',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
    borderColor: 'gray',
    borderWidth: 1,
  },
  buttonContainer: {
    marginBottom: 20,
  },
});

export default Form;
