import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const requireJson = (library) => {
    switch (library) {
      case 'agora':
        return require('../seats/agora.json');
      case 'agora-blok-rooms':
        return require('../seats/agora-blok-rooms.json');
      case 'agora-flexispace':
        return require('../seats/agora-flexispace.json');
      case 'ebib':
        return require('../seats/ebib.json');
      case 'arenberg-main':
        return require('../seats/arenberg-main.json');
      case 'arenberg-rest':
        return require('../seats/arenberg-rest.json');
      case 'arenberg-tulp':
        return require('../seats/arenberg-tulp.json');
      case 'erasmus':
        return require('../seats/erasmus.json');
      case 'agora-rooms':
        return require('../seats/agora-rooms.json');
      case 'kulak':
        return require('../seats/kulak.json');
      default:
        return null;
    }
  };
const AvailabilityList = () => {
  const [formData, setFormData] = useState<any>(null);
  const [groupedData, setGroupedData] = useState<any>(null);
  const [asyncStorageValue, setAsyncStorageValue] = useState<string | null>(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const chunkSize = 10; 
  const scrollThreshold = 300; 

  const updateReservations = async () => {
    setGroupedData(null);
    try {
      const storedFormData = await AsyncStorage.getItem('formData');
      if (storedFormData !== null) {
        const parsedFormData = JSON.parse(storedFormData);
        setFormData(parsedFormData);
      }
    } catch (error) {
      console.error('Error reading AsyncStorage for formData:', error);
    }

    try {
      const storedRNumber = await AsyncStorage.getItem('rnumber');
      if (storedRNumber !== null) {
        setFormData(prevFormData => ({
          ...prevFormData,
          rnumber: storedRNumber,
        }));
      }
    } catch (error) {
      console.error('Error reading AsyncStorage for rnumber:', error);
    }

    console.log(formData);

    if (!formData) return;

    const json = requireJson(formData.selectedLibrary);
    if (!json) {
      console.error('No JSON file found for the selected library');
      return;
    }

    const keys = Object.keys(json);
    const selectedDate = new Date(formData.date);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    const startDateTime = `${formattedDate}T00:00:00`;
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    const nextDayFormattedDate = nextDay.toISOString().split('T')[0];
    const endDateTime = `${nextDayFormattedDate}T00:00:00`;
    const resourceIDList = keys.join(',');

    const link = `https://wsrt.ghum.kuleuven.be/service1.asmx/GetReservationsJSON?uid=${formData.rnumber}&ResourceIDList=${resourceIDList}&startdtstring=${startDateTime}&enddtstring=${endDateTime}`;
    console.log(link);
    fetch(link)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        data.sort((a, b) => {
          if (a.ResourceID !== b.ResourceID) {
            return a.ResourceID - b.ResourceID;
          } else {
            return a.Status.localeCompare(b.Status);
          }
        });

        const groupedData = data.reduce((acc, curr) => {
          const { ResourceID, Status, Startdatetime } = curr;
          const hourIndex = new Date(Startdatetime).getHours();
          acc[ResourceID] = acc[ResourceID] || Array.from({ length: 24 }, () => null);
          acc[ResourceID][hourIndex] = Status;
          return acc;
        }, {});

        for (const resourceId in groupedData) {
          groupedData[resourceId] = groupedData[resourceId].map(status => status === null ? "A" : status);
        }

        setGroupedData(groupedData);
        setCurrentChunkIndex(0);
        console.log("sorted");
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  };

  useEffect(() => {
    const checkAsyncStorageValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem('formData');
        if (storedValue !== asyncStorageValue) {
          setAsyncStorageValue(storedValue);
          updateReservations();
          console.log("stored value updated")
        }
      } catch (error) {
        console.error('Error reading AsyncStorage:', error);
      }
    };

    checkAsyncStorageValue();
    const interval = setInterval(checkAsyncStorageValue, 100); // Poll every 100 milliseconds

    return () => clearInterval(interval);
  }, [asyncStorageValue]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
  
    if (contentHeight - (offsetY + scrollViewHeight) < scrollThreshold) {
      // Load next chunk
      setCurrentChunkIndex(prev => prev + chunkSize);
  
      console.log(currentChunkIndex);
    }
  };
  useEffect(() => {
    if (currentChunkIndex > 0 && groupedData) {
      //scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [groupedData, currentChunkIndex]);

  const renderWidgets = () => {
    if (!groupedData) {
      return (
        <View style={styles.throbberContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    // Simulate chunking based on currentChunkIndex
    const chunkedData = Object.entries(groupedData).slice(0, currentChunkIndex + chunkSize);

    return chunkedData.map(([resourceId, statuses]) => (
      <View key={resourceId} style={styles.widgetContainer}>
        <Text style={styles.resourceId}>Resource: {resourceId}</Text>
        <View style={styles.statusesContainer}>
          {statuses.map((status, index) => (
            <Text key={index} style={[styles.status, getStatusStyle(status)]}>
              {status}
            </Text>
          ))}
        </View>
      </View>
    ));
  };

  const getStatusStyle = (status) => {
    let statusStyle = [styles.status]; 
    switch (status) {
      case 'A':
        statusStyle.push(styles.statusAvailable);
        break;
      case 'B':
        statusStyle.push(styles.statusBooked);
        break;
      case 'C':
        statusStyle.push(styles.statusClosed);
        break;
      default:
        statusStyle.push(styles.statusDefault);
        break;
    }

    return statusStyle;
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.availabilityContainer}>
        {renderWidgets()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  availabilityContainer: {
    width: '100%',
    padding: 10,

    borderRadius: 5,
    marginTop: 10,
  },
  widgetContainer: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  resourceId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  status: {
    width: 9.5, 
    textAlign: 'center',
    margin: 1,
    padding: 0,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusAvailable: {
    backgroundColor: 'green',
    color: 'white',
  },
  statusBooked: {
    backgroundColor: 'red',
    color: 'white',
  },
  statusClosed: {
    backgroundColor: 'gray',
    color: 'white',
  },
  statusDefault: {
    backgroundColor: '#ccc',
    color: 'black',
  },
  throbberContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
});

export default AvailabilityList;
