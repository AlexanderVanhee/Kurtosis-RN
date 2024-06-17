import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Text, View, StyleSheet, useColorScheme, Button, TouchableHighlight} from 'react-native';
import Form from './Form';
import RNumberPrompt from './RNumberPrompt';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import AvailabilityList from './AvailibilityList';


interface FormData {
    selectedLibrary: string;
    date: string;
  }

const Drawer = createDrawerNavigator();
const noop = () => {console.log('Rnumber entered');};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [showRNumberPrompt, setShowRNumberPrompt] = useState(false);


 

  useEffect(() => {
    //Displays the r-number pop up if number isnt found in AsyncStorage.
    const checkRNumber = async () => {
      try {
        const storedRNumber = await AsyncStorage.getItem('rnumber');
        if (!storedRNumber) {
          setShowRNumberPrompt(true);
        }
      } catch (error) {
        console.error('Error checking R-number:', error);
      }
    };

    checkRNumber();
  }, []);

  const handleFormSubmit = async (data: any) => {
    
    try {
        const formDataString = JSON.stringify(data);
        await AsyncStorage.setItem('formData', formDataString);

      } catch (error) {
        console.error('Error saving formData:', error);
      }

    navigation.navigate('Grid');



  };

  const handleRnumberEntered = (rnumber: string) => {
    console.log('Rnumber entered:', rnumber);
    setShowRNumberPrompt(false);
  };

  return (
    <View style={styles.screen}>
      {showRNumberPrompt ? (
        <RNumberPrompt onRNumberEntered={handleRnumberEntered} />
      ) : (
        <Form  onSubmit={handleFormSubmit}/>
      )}
    </View>
  );
};

const SettingsScreen = () => (
  <View style={styles.screen}>
    <RNumberPrompt onRNumberEntered={noop} />
  </View>
);

const GridScreen = (data: any) => (
    <View style={styles.screen}>
      <AvailabilityList />
    </View>
  );

const DrawerContent = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.drawerContent}>


        <TouchableHighlight
        onPress={() => navigation.navigate('Home')}
        underlayColor='#042417'>
        <View
            >
            <Icon
            name='fontawesome|facebook-square'
            size={25}
            color='#042'></Icon>
            <Text>Sign In with Facebook</Text>
        </View>
        </TouchableHighlight>
      <Button  title="Home" onPress={() => navigation.navigate('Home')} />
      <Button  title="Settings" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
};

const Navigation: React.FC = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <NavigationContainer theme={scheme === 'dark' ? NavigationDarkTheme : undefined}>
            <Drawer.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? '#333' : '#fff' },
          headerTintColor: isDark ? '#fff' : '#000',
          drawerStyle: { backgroundColor: isDark ? '#333' : '#fff' },
          drawerLabelStyle: { color: isDark ? '#fff' : '#000' },
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="Grid" component={GridScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  text: {
    color: '#fff',
  },
});

export default Navigation;
