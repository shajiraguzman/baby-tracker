import React, { Component, useState } from "react";
import { StyleSheet, Button, View, Text, TextInput, TouchableOpacity, FlatList, Image, ScrollView } from "react-native";
import { SafeAreaView, withSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from '../config/firebase'
import { Ionicons } from "@expo/vector-icons";
import { ref, push, set, query, orderByChild, equalTo, onValue, get } from "firebase/database";



export default function About({ navigation }) {
  const goToSettings = () => {
    navigation.navigate('Settings'); // Navigate without parameters
  };

  return (
    <ScrollView automaticallyAdjustKeyboardInsets={true} style={{ backgroundColor: "#cfe2f3" }}>
      <View className="flex-1">
        <SafeAreaView style={{ flex: 0 }}>
          <View className="flex-row justify-center">
            <TouchableOpacity style={{ position: "absolute", left: 22, top: 27, zIndex: 10 }} onPress={goToSettings}>
              <Ionicons name= "arrow-back" size={30} color= "#28436d"/>
            </TouchableOpacity>
            <Image source={require('../assets/logo.png')} style={{ width: 225, height: 225 }}/>
          </View>
          <View className="flex-row justify-center">
            <Text className="text-white" style={styles.titleText}>About</Text>
          </View>
        </SafeAreaView>
          
        <View style={styles.mainBody}> 
          <View>
            <Text style={{ fontSize: 18, color: '#28436d'}}>
              Welcome to the BabyTracker app! We are dedicated to providing the best experience for our users by delivering exceptional services and features that make life easier. Our app focuses on providing a seamless experience for parents to simplify infant care through an intuitive digital solution, aligning with the convenience of organized information to enhance infant well-being through technology.
              {'\n\n'}
            
              <Text style={styles.subtitle}>Our Mission</Text> {'\n\n'}
              <Text style={styles.text}>
                Our mission is to provide a seamless experience for each parent to input their child’s data along with any additional info provided by a babysitter, caregiver, or anyone who is taking on baby duty for the day. We strive to make a difference by ensuring quality and user satisfaction in every feature we provide.
                {'\n\n'}
              </Text>
              
              <Text style={styles.subtitle}>Meet the Team</Text> {'\n\n'}
              <Text style={styles.text}>
              Our team is composed of passionate individuals who are senior year students at the University of North Texas. The BabyTracker app is our senior year project. We look forward to growing our skills to deliver an app that meets your expectations and continually improves with your feedback.
                {'\n\n'}
                Sincerely, {'\n\n'}
                Shajira Guzman{'\n'}Sagar Gyawali{'\n'}Kelley Le{'\n'}Sumat Kusum Sedhain{'\n'}Neha Shrestha{'\n'}Edwin Smith{'\n'}
              </Text>
            </Text>
          </View>

          <View className="flex-row justify-center">
              <Image source={require('../assets/meanGreen.png')} style={{ width: 200, height: 225 }}/>
          </View>
          <Text style={styles.footer}>
            Thank you for being part of our journey. We hope to keep exceeding your expectations!
          </Text> 
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

    mainBody: { 
        flex: 1, 
        backgroundColor: 'white', 
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
    subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#007AFF',
  },  
    ageText: {
      color: '#28436d',
      fontSize: 17,
    },
    footer: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
  });


  


