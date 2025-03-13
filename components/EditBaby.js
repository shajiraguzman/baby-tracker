import React, { Component, useState, useEffect } from "react";
import { StyleSheet, Button, View, Text, TouchableOpacity, TextInput, Platform, ScrollView, Alert } from "react-native";
import { SafeAreaView, withSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from '../config/firebase'
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { getDatabase, ref, get, child, update } from 'firebase/database';
import RNPickerSelect from 'react-native-picker-select';
import Dialog from "react-native-dialog";

export default function EditBaby({ route, navigation }) {

  const { fullName, babyID, DOB, caretakers} = route.params; 
  const [dob, setDOB] = useState(new Date()); // date of birth
  const [dobSelected, setDOBSelected] = useState(false); // has date of birth been selected
  const [showPicker, setShowPicker] = useState(false); // state for showing the date picker
  const [name, setName] = useState("");
  const [selectedCaretaker, setSelectedCaretaker] = useState("");
  const [fullNames, setFullNames] = useState([]);
  const [selectedCaretakerId, setSelectedCaretakerId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selecteddisplayName, setdisplayName] = useState(fullName);
  const nameToSave = name.trim() === "" ? fullName : name;

  useEffect(() => {
    const fetchCaretakersFullNames = async () => {
      const names = [];
      const dbRef = ref(database);
      if (caretakers === undefined) {
        console.log("there are no caretakers");
        return 0;
      }
      for (const caretakerId of caretakers) {
        try {
          const snapshot = await get(child(dbRef, `parents/${caretakerId}`));

          if (snapshot.exists()) {
            names.push({ id: caretakerId, fullName: snapshot.val().fullName });
          } else {
            console.log(`No such parent with ID: ${caretakerId}`);
          }
        } catch (error) {
          console.error('Error fetching parent:', error);
        }
      }

      setFullNames(names); // Set state with the retrieved full names and IDs
      
    };

    fetchCaretakersFullNames();
    console.log(fullNames);    
  }, [caretakers]);



  const removeCaretaker = async () => {
    console.log('Removing caretaker with ID:', selectedCaretakerId);

   const updatedCaretakers = caretakers.filter(id => id !== selectedCaretakerId);
   console.log("updated caretakers:") 
   console.log(updatedCaretakers);
   try {
     // Update the Realtime Database
     const babyRef = ref(database, `babies/${babyID}`);
     await update(babyRef, { caretakers: updatedCaretakers });

     // Update local state
     //setCaretakersArray(updatedCaretakers);
     console.log('Caretaker removed successfully');
   } catch (error) {
     console.error('Error removing caretaker: ', error);
   }

   const updatedFullNames = fullNames.filter(caretaker => caretaker.id !== selectedCaretakerId);
    
   // Update state with the new array
   setFullNames(updatedFullNames);
   console.log(fullNames); 
    setVisible(false);
    Alert.alert("Caretaker removed.");
  };

  console.log(DOB);

  const showDialog = () => {
      console.log("selected caretakerID: ", selectedCaretakerId);
      setVisible(true);
  };


  
  const updateBaby = () => {
    const babyRef = ref(database, `babies/${babyID}`);

    if (name.trim() === "") {
      setName(fullName);
      console.log("name field left empty")
    }
    const finalDOB = dobSelected ? dob.toLocaleDateString() : DOB;

    get(babyRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const currentData = snapshot.val();

                // Update the baby record
                update(babyRef, {
                  DOB: finalDOB, 
                  fullName: nameToSave
                })
                .then(() => {
                    console.log("Name and DOB updated successfully.");
                })
                .catch((error) => {
                    console.error("Error updating: ", error);
                });
            }
        })
        .catch((error) => {
            console.error("Error fetching baby data: ", error);
        });
        setdisplayName(nameToSave);
        Alert.alert("Baby's profile has been updated.");
};

  return (
  <ScrollView automaticallyAdjustKeyboardInsets={true} contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}> 
    <View className="flex-1 bg-white" style={{ backgroundColor: "#cfe2f3" }}>
    <SafeAreaView style={{ flex: 0 }}>
        <View className="flex-row justify-center" style={styles.container}>
            <TouchableOpacity style={{ position: "absolute", left: 22, top: 27 }} onPress={()=> navigation.navigate('Profiles')}>
            <Ionicons name= "arrow-back" size={30} color= "#28436d"/>
            </TouchableOpacity>
            <Text className="text-white mt-5" style={styles.titleText}>{selecteddisplayName}'s Info</Text>
        </View>
    </SafeAreaView>
    <View style={styles.mainBody}> 
        <View className="flex-row justify-center mt-3">
        <Text style={{ fontSize: 18, color: '#28436d', fontWeight: 'bold', textAlign: 'center' }}>Edit Baby's Name or DOB</Text>
        </View>

        <View className="form space-y-1 pt-5" style={{ flex: 0, justifyContent: "center"}}>
            {/* Baby Name */}
            <Text className="flex-end text-gray-700 ml-2">Baby's Name</Text>
            <TextInput className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" 
            value={name} onChangeText={value=> setName(value)} editable={true} placeholder={fullName}/>

            {/* DOB */}
            <Text className="text-gray-700 ml-2">Baby's Date of Birth</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
            <View className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" style={{ height: 50, justifyContent: 'center' }}>
              <Text>
                {dobSelected ? (dob.toLocaleDateString()) : (<Text className="p-4 bg-gray-100 text-#A9A9A9 rounded-2xl mb-3" style={{ color: '#C7C7C7' }}>{DOB}</Text>)}
              </Text>
              </View>
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
        </View>
        <TouchableOpacity className="py-1 bg-blue-200 rounded-3xl mt-5 mb-8">
            <Text className="font-xl text-center text-gray-700 text-xl" onPress={()=> updateBaby()}>Save</Text>
         </TouchableOpacity>
         <View className="flex-row justify-center mt-3">
        <Text style={{ fontSize: 18, color: '#28436d', fontWeight: 'bold', textAlign: 'center' }}>Remove a Caretaker</Text>
        </View>

        <View>

      {fullNames.length === 0 ? (
        <Text style={{ fontSize: 18, color: '#28436d', textAlign: 'center', marginTop: 5 }}>There are no caretakers for this profile.</Text>
      ) : (
        <>
          <Picker
            selectedValue={selectedCaretakerId}
            onValueChange={(itemValue) => setSelectedCaretakerId(itemValue)}
          >
            <Picker.Item label="Select a caretaker" value={null} />
            {fullNames.map(({ id, fullName }) => (
              <Picker.Item key={id} label={fullName} value={id} />
            ))}
          </Picker>
          <TouchableOpacity className="py-1 bg-blue-200 rounded-3xl mt-5 mb-8">
            <Text className="font-xl text-center text-gray-700 text-xl" onPress={()=> showDialog()}>Remove Caretaker</Text>
         </TouchableOpacity>
          <Dialog.Container visible={visible}>
              <Dialog.Title>Confirm Deletion</Dialog.Title>
              <Dialog.Description>
                  Are you sure you want to delete this caretaker?
              </Dialog.Description>
              <Dialog.Button label="Cancel" onPress={() => setVisible(false)} />
              <Dialog.Button label="Delete" onPress={removeCaretaker} color="red" />
              </Dialog.Container>
        </>
      )}
    </View>
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

  inputBox: {

  }

});