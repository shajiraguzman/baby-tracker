import React, { Component, useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Text, TextInput, Modal, ScrollView, Button, Alert } from "react-native";
import { SafeAreaView, withSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithEmailAndPassword, sendPasswordResetEmail, getAuth } from "firebase/auth";
import { auth } from '../config/firebase';
import { Ionicons } from "@expo/vector-icons";
import Checkbox from 'expo-checkbox';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);



  useEffect(() => {
    // Check if email is stored in AsyncStorage
    const getStoredEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('rememberedEmail');
      if (storedEmail) {
        setEmail(storedEmail);
        setIsChecked(true);
      }
    };
    getStoredEmail();
  }, []);


  const handleSubmit = async ()=>{
    if (email && password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        if (isChecked) {
          await AsyncStorage.setItem('rememberedEmail', email);
          console.log("Remember me checked!");
        } else {
          await AsyncStorage.removeItem('rememberedEmail');
        }
      }
      catch (err) {
        console.log('got error: ', err.message);
        Alert.alert("Invalid email or password.")
      }
  
    }

  }  
  
  const resetPassword = (email) => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('Password reset email sent!');
      })
      .catch((error) => {
        Alert.alert("Invalid email.");
      });
  };

  const ForgotPasswordModal = ({ visible, onClose }) => {
    const [email, setEmail] = useState('');
  
    const handlePasswordReset = () => {
      if (!email) {
        Alert.alert('Please enter your email address');
        return;
      }
      resetPassword(email); 
      onClose(); 
    };
  
    return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.instructions}>
            Enter your email address. If the email is an existing user, you will receive a password reset link.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button title="Send Reset Email" onPress={handlePasswordReset} />
          <Button title="Cancel" onPress={onClose} color="#808080" />
        </View>
      </View>
    </Modal>
    );
  };





  return (
    <ScrollView automaticallyAdjustKeyboardInsets={true}
      style={{ backgroundColor: "#cfe2f3" }}
    >
      <View className="flex" style={{ backgroundColor: "#cfe2f3" }}>
        <SafeAreaView className="flex">
            <View className="flex-row justify-center">
              <Image source={require('../assets/logo.png')} style={{ width: 225, height: 225 }}/>
            </View>

            <View className="flex-row justify-center" style={styles.container}>
              <Text className="text-white" style={styles.welcomeText}>Welcome!</Text>
            </View>
            
            <View className="flex-row justify-center pt-1" style={styles.container}>
              <Text className="text-white" style={styles.signInText}>Sign in to your account</Text>
            </View>
        </SafeAreaView>

        <View className="flex-1 bg-white px-8 pt-10" style={{ borderRadius: 50 }}>
          <View className="form space-y-2">
          
            <Text className="text-gray-700 ml-2">Email Address</Text>

            <TextInput className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" 
              value={email} onChangeText={value=> setEmail(value)} placeholder='Enter Email'/>

            <Text className="text-gray-700 ml-2">Password</Text>
  
            <View className="space-y-3">
              <TextInput className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" 
                secureTextEntry={!showPassword} value={password} onChangeText={value=> setPassword(value)} placeholder='Enter Password'/>
              
              <TouchableOpacity onPress={()=>setShowPassword(!showPassword)} style={{ position: "absolute", right: 12 }}>
                {
                  showPassword == true ? ( <Ionicons name= "eye" size={24} color= "grey"/> ) : ( <Ionicons name= "eye-off" size={24}  color= "grey"/> )
                }
              </TouchableOpacity>
            </View>

            <View className= "flex-row ml-1 mb-3">
              <Checkbox style={{ marginRight: 8 }} value={isChecked} onValueChange={setIsChecked} color={isChecked ? "grey" : undefined}/>

              <Text className="text-gray-500">Remember Me</Text>

              <TouchableOpacity
                style={{ position: "absolute", right: 6 }}
                onPress={() => setModalVisible(true)}
              >
                <Text className="text-gray-500">Forgot password?</Text>
              </TouchableOpacity>

              <ForgotPasswordModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
              />
            </View>

            <TouchableOpacity onPress={handleSubmit} className="py-3 bg-blue-300 rounded-xl">
              <Text className="font-xl font-bold text-center text-gray-700">Login</Text>
            </TouchableOpacity>

            <Text className="text-gray-700 text-center py-2">or</Text>

            <TouchableOpacity className="py-3 bg-blue-300 rounded-xl mb-20" onPress={()=> navigation.navigate('Register')}>
              <Text className="font-xl font-bold text-center text-gray-700">Register</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  welcomeText: {
    color: '#28436d',
    fontSize: 40,
    fontWeight: 'bold',
  },
  
  signInText: {
    color: '#28436d',
    fontFamily: 'lucida grande',
    fontSize: 20,
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },



});