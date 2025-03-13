import React, { Component, useState } from "react";
import { StyleSheet, Button, View, Text, TextInput, TouchableOpacity, FlatList, Image, Alert } from "react-native";
import { SafeAreaView, withSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from '../config/firebase'
import { Ionicons } from "@expo/vector-icons";
import { ref, push, set, query, orderByChild, equalTo, onValue, get } from "firebase/database";


export default function ShareBaby({ route, navigation }) {
    const { fullName, babyID, caretakers } = route.params; 
    const [email, setEmail] = useState('');
    const [result, setResult] = useState(null);


    const handleSubmit = async () => {
        if (!email) { //if email field is empty
            Alert.alert("Error", "Email cannot be empty.");
            return;
        }
        
        const inputEmail = email.toLowerCase(); // Convert user input to lowercase
        const currentUserEmail = auth.currentUser?.email?.toLowerCase();
        if (currentUserEmail && inputEmail === currentUserEmail) {
            Alert.alert("Error", "Cannot share a profile with the current user.");
            return;
        }


        const parentsRef = ref(database, 'parents');
        const parentsQuery = query(parentsRef, orderByChild('email'));
        
        //check if the email the user entered exists
        try {
            const snapshot = await get(parentsQuery);
            if (snapshot.exists()) {
                const users = snapshot.val();

                //const inputEmail = email.toLowerCase(); // Convert user input to lowercase

                // Check if any parent has the matching email
                const parent = Object.values(users).find(parent => parent.email.toLowerCase() === inputEmail);

                if (parent) { //if parent exists
                    
                    if (!Array.isArray(caretakers)) {
                        addAlert(parent);
                    }
                    else if(caretakers.includes(parent.parentID)){ //check if parent is already part of current babies caretaker list
                        Alert.alert("User is already shared with this baby.");
                    }
                    else { //add alert
                        addAlert(parent);                            
                    }   
                } else {
                    Alert.alert("Error", "No user found with that email.");
                    console.log("parent does not exist")
                }
            } else {
                Alert.alert("Error", "No parents data exists.");
            }
        } catch (error) {
            Alert.alert("Error", "Error fetching data: " + error.message);
        } 
    };

    
    const addAlert = async (parent) => {
        
        //pull alert data
        const alertRef = ref(database, 'alert/');
        const alertQuery = query(alertRef);

        try {
            const snapshot = await get(alertQuery);
            if (snapshot.exists()) {
                const alerts = snapshot.val();
                const alertParentIDFound = Object.values(alerts).find(alertParentIDFound => alertParentIDFound.parentID === parent.parentID);
                const alertBabyIDFound = Object.values(alerts).find(alertBabyIDFound => alertBabyIDFound.babyID === babyID);
                
                // Check if any alerts exist with this parentID and babyID
                if (alertParentIDFound && alertBabyIDFound) {
                    console.log("alert for parentID and babyID pair already exists: " + alertParentIDFound.parentID + " and " + alertBabyIDFound.babyID);
                    Alert.alert("Request has already been sent.");

                } else { //create alert
                    const newAlertRef = push(alertRef);
                    const alertKey = newAlertRef.key;
                    const user = auth.currentUser.email.split('@')[0];

                    // adding new alert entry with a uniquely generated key
                    const newAlert = {
                      parentID: parent.parentID,
                      babyID: babyID,
                      alertID: alertKey,
                      message: user + " has added you as a caretaker for " + fullName
                    };
                
                    // Set the new alert entry in the database and do a catch error in case there is an error
                    set(newAlertRef, newAlert).then (() => {
                      console.log("Alert was successfully added")
                      Alert.alert("Request sent!");
                    }).catch((error) => {
                      console.log(error);
                    })
                    navigation.navigate('Profiles');
                }
            } else {
                Alert.alert("Error", "No alert data exists.");
            }
        } catch (error) {
            Alert.alert("Error", "Error fetching data: " + error.message);
        }
    };

    return (
        <View className="flex-1 bg-white" style={{ backgroundColor: "#cfe2f3" }}>
            <SafeAreaView style={{ flex: 0 }}>
                <View className="flex-row justify-center" style={styles.container}>
                    <TouchableOpacity style={{ position: "absolute", left: 22, top: 27 }} onPress={()=> navigation.navigate('Profiles')}>
                    <Ionicons name= "arrow-back" size={30} color= "#28436d"/>
                    </TouchableOpacity>
                    <Text className="text-white mt-5" style={styles.titleText}>Share Baby</Text>
                </View>
            </SafeAreaView>

            <View style={styles.mainBody}> 
                <View className="flex-row justify-center">
                <Text className="text-black font-bold mb-5" style={{ fontSize: 25 }}>User Info</Text>
                </View>
                <View>
                <Text>You can share {fullName}'s profile with another user! Another user (like a sitter or another parent)
                     can add logs to your baby's profile. This data will sync into all devices, keeping {fullName}'s info up to date all day!</Text>
                </View>
                <View className="form space-y-1 pt-10" style={{ flex: 0, justifyContent: "center"}}>
                    <Text className="flex-end text-gray-700 ml-2">Enter User's Email</Text>
                    <TextInput className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" 
                    value={email} onChangeText={value=> setEmail(value)} placeholder='Enter Email'/>
                </View>
                <TouchableOpacity className="py-1 bg-blue-300 rounded-3xl mt-5 mb-8">
                    <Text className="font-xl text-center text-gray-700 text-xl" onPress={()=> handleSubmit()}>Share</Text>
                 </TouchableOpacity>
            </View>

        </View>
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
  });


  


