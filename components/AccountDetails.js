import React, { Component, useState, useEffect } from "react";
import { StyleSheet, Button, View, Text, TouchableOpacity, TextInput, Platform, ScrollView, Alert } from "react-native";
import { SafeAreaView, withSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from '../config/firebase'
import { Ionicons } from "@expo/vector-icons";
import { getDatabase, ref, get, child, update, onValue } from 'firebase/database';

export default function AccountDetails({ navigation }) {

  const [parentInfo, setParentInfo] = useState([]);

  const handleGoBack = () => {
    navigation.goBack(); // This will navigate back to the previous screen
  };

  const getParent = () => {
    const parentRef = ref(database, `parents/${auth.currentUser.uid}`);
    const unsubscribe = onValue(parentRef, (snapshot) => {
        if (snapshot.exists()) {
            const info = snapshot.val();
            setParentInfo(info);
        }
    }, (error) => {
        console.log("Error fetching parent data: ", error.message);
    });

    return unsubscribe; // Return the unsubscribe function
};

useEffect(() => {
    const unsubscribe = getParent(); // Start listening for changes
    return () => unsubscribe();
}, []);


  return (
  <ScrollView automaticallyAdjustKeyboardInsets={true} contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}> 
    <View className="flex-1 bg-white" style={{ backgroundColor: "#cfe2f3" }}>
    <SafeAreaView style={{ flex: 0 }}>
        <View className="flex-row justify-center" style={styles.container}>
            <TouchableOpacity style={{ position: "absolute", left: 22, top: 27 }} onPress={handleGoBack}>
            <Ionicons name= "arrow-back" size={30} color= "#28436d"/>
            </TouchableOpacity>
            <Text className="text-white mt-5" style={styles.titleText}>Account Details</Text>
        </View>
    </SafeAreaView>
    <View style={styles.mainBody}> 
          <View className="form space-y-1 pt-5" style={{ flex: 0, justifyContent: "center"}}>
            <Text className="flex-end text-gray-700 ml-2">Name</Text>
            <TextInput className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" 
            editable={false} placeholder={parentInfo.fullName}/>

            <Text className="flex-end text-gray-700 ml-2">Email</Text>
            <TextInput className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" 
            editable={false} placeholder={parentInfo.email}/>

            <Text className="flex-end text-gray-700 ml-2">Username</Text>
              <TextInput className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" 
              editable={false} placeholder={parentInfo.username}/>  
            </View>
            <TouchableOpacity className="py-1 bg-blue-200 rounded-3xl mt-5 mb-8" onPress={handleGoBack}>
            <Text className="font-xl text-center text-gray-700 text-xl font-bold">Done</Text>
         </TouchableOpacity>    
        </View>
        <View>
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