import React, { Component, useState } from "react";
import { Button, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Platform } from "react-native";
import { SafeAreaView, withSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ref, push, set } from "firebase/database";
import { auth, database} from '../config/firebase'
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddProfile({ navigation }) {

  const [name, setName] = useState(''); // name
  const [dob, setDOB] = useState(new Date()); // date of birth
  const [dobSelected, setDOBSelected] = useState(false); // has date of birth been selected
  const [showPicker, setShowPicker] = useState(false); // state for showing the date picker
  const [gender, setGender] = React.useState('first'); // gender radio buttons

  function createBaby() {
    const babyRef = ref(database, 'babies/');
    const newBabyRef = push(babyRef);
    const babyKey = newBabyRef.key;

    // Create the new baby entry with a uniquely generated key
    const newBaby = {
      fullName: name,
      DOB: dob.toLocaleDateString(),
      babyID: babyKey,
      Gender: gender,
      parents: [auth.currentUser.uid]
    };

    // Set the new baby entry in the database and to a catch error in case there is an error
    set(newBabyRef, newBaby).then (() => {
      console.log("Baby was successfully added")
    }).catch((error) => {
      console.log(error);
    })
  };

  function handleOnPress() {
    //setOpen(!open);
    createBaby();
    navigation.navigate('Profiles');
  }

  return (
    <ScrollView automaticallyAdjustKeyboardInsets={true} style={{ backgroundColor: 'white' }}>
      <View className="flex-1 bg-white" style={{ backgroundColor: "#cfe2f3" }}>
        <SafeAreaView className="flex">
          <View className="flex-row justify-center" style={styles.container}>
              <TouchableOpacity style={{ position: "absolute", left: 22, top: 27 }} onPress={()=> navigation.navigate('Profiles')}>
                <Ionicons name= "arrow-back" size={30} color= "#28436d"/>
              </TouchableOpacity>
              
            <Text className="text-white mt-5" style={styles.titleText}>Add Profile</Text>
          </View>
        </SafeAreaView>

        <View style={styles.mainBody}>
          <View className="flex-row justify-center">
            <Text className="text-black font-bold mb-5" style={{ fontSize: 25 }}>Baby Info</Text>
          </View>

          <View className="form space-y-1" style={{ flex: 1, justifyContent: "center"}}>

            {/* Name */}
            <Text className="flex-end text-gray-700">Name</Text>
            <TextInput className="p-4 bg-gray-100 text-gray-700 mb-3" 
              value={name} onChangeText={value=> setName(value)} placeholder='Enter name'/>

            {/* DOB */}
            <Text className="text-gray-700">Date of Birth</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <Text
                className="p-4 bg-gray-100 text-gray-700 mb-3">
                {dobSelected ? (dob.toLocaleDateString()) : (<Text className="text-gray-400 opacity-60">Enter DOB</Text>)}
              </Text>
            </TouchableOpacity>
            {showPicker && (
              <View>  
                <DateTimePicker
                  value={dob}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (Platform.OS === 'android') { // Android automatically has confirm button
                      setShowPicker(false);
                    }
                    if (date) {
                      setDOB(date); // Set selected date from date picker
                      setDOBSelected(true);
                    }
                  }}
                  maximumDate={new Date()} // Restrict date picker to the current date
                />
                {Platform.OS === 'ios' && ( // manually add confirmation button for iOS
                  <Button
                    title="Done"
                    onPress={() => {
                      setShowPicker(false);
                    }}
                  />
                )}
              </View>
            )}

            {/* Gender */}
            <Text className="text-gray-700 mb-3">Gender</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {/* Male Image */}
              <View style={{ flexDirection: 'row', marginLeft: 70 }}>
                <TouchableOpacity onPress={() => setGender('Male')}>
                  <Image
                    source={require('../assets/boy.png')}
                    style={{
                      width: 35,
                      height: 38,
                      tintColor: gender === 'Male' ? '#8ec3ff' : 'gray',
                    }}
                  />
                </TouchableOpacity>
              </View>

              {/* Female Image */}
              <View style={{ flexDirection: 'row', marginRight: 70 }}>
                <TouchableOpacity onPress={() => setGender('Female')}>
                  <Image
                    source={require('../assets/girl.png')}
                    style={{
                      width: 59,
                      height: 36,
                      tintColor: gender === 'Female' ? '#f8a6c5' : 'gray',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <TouchableOpacity className="py-1 bg-blue-300 rounded-3xl mt-5 mb-8">
            <Text className="font-xl text-center text-gray-700 text-3xl" onPress={()=> handleOnPress()}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 

const styles = StyleSheet.create({


  mainBody: { //for the rounded edges in the main body of each screen
    flex: 1, // this allows the view to take the remaining space
    backgroundColor: 'white', 
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 16,
    overflow: 'hidden', 
    paddingHorizontal: 32, 
    paddingTop: 32, 
  },


  titleText: {
    color: '#28436d',
    fontSize: 35,
    fontWeight: 'bold',
  },

  nameText: {
    color: '#28436d',
    fontSize: 27,
    fontWeight: 'bold',
  },

  ageText: {
    color: '#28436d',
    fontSize: 17,
  },

  selectedRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8ec3ff',
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }
});