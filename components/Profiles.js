import React, { Component, useState, useEffect, useMemo } from "react";
import { StyleSheet, Button, View, TouchableOpacity, Image, Text, TextInput, Touchable, ScrollView, FlatList, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView, withSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ref, push, set, query, orderByChild, equalTo, onValue, get, remove } from "firebase/database";
import { auth, database} from '../config/firebase'
import Dialog from "react-native-dialog";

export default function Profiles({ navigation }) {
    const [isLoading, setIsLoading] = useState(true);
    const[myAlerts, setMyAlerts] = useState([]); //stores alerts for this user
    const [visible, setVisible] = useState(false);
    const [selectedBaby, setSelectedBaby] = useState(null);

    const handleLogout = () => {
        auth.signOut().then(() => {
            // Sign-out successful.
            navigation.navigate('Login'); // Navigate to your login screen
        }).catch((error) => {
            // An error happened.
            console.error(error);
        });
    };


    // Function to set up listener for alerts
    const addAlert = () => {
        const alertRef = ref(database, 'alert/');
        const alertQuery = query(alertRef, orderByChild('parentID'));

        // Set up a listener
        const unsubscribe = onValue(alertQuery, (snapshot) => {
            if (snapshot.exists()) {
                const alerts = snapshot.val();
                const filteredAlerts = Object.values(alerts).filter(a => a.parentID === auth.currentUser.uid);

                // Update state with filtered alerts
                setMyAlerts(filteredAlerts);
            } else {
                setMyAlerts([]); // No alerts found
            }
        }, (error) => {
            console.log("Error fetching data: ", error.message);
        });

        // Cleanup listener on unmount
        return unsubscribe; // Return the unsubscribe function
    };

    // Use useEffect to call addAlert when the component mounts
    useEffect(() => {
        const unsubscribe = addAlert(); // Start listening for changes
        return () => unsubscribe();
    }, []);

    //check if the baby exists, and get its ID, then pull data
    const babiesRef = ref(database, 'babies');
    const[myBabies, setMyBabies] = useState([]);
    console.log("logged in user is: " + auth.currentUser.uid);
    
    const allBabiesQuery = useMemo(() => (
        query(babiesRef, orderByChild('parents'))
    ), [babiesRef]);
    
    useEffect(() => {
        const unsubscribe = onValue(allBabiesQuery, (snapshot) => {
                if (snapshot.exists()) {
                    const babies = snapshot.val();
                    // Filter babies based on the "parents" array
                    const filteredBabies = Object.values(babies).filter(baby => baby.parents && baby.parents.includes(auth.currentUser.uid));
                    

                    // Filter babies based on the "caretakers" array and add isCaretaker flag
                    const caretakerBabies = Object.values(babies).filter(baby => 
                        baby.caretakers && baby.caretakers.includes(auth.currentUser.uid)
                    ).map(baby => ({
                        ...baby,     
                        isCaretaker: true // Add the isCaretaker flag
                    }));

                    // Combine both filtered arrays
                    const combinedBabies = [...filteredBabies, ...caretakerBabies];

                    // Set combined babies to state
                    setMyBabies(combinedBabies);

                    // Set filtered babies to state
                   // setMyBabies(filteredBabies);
                 
                } else {
                    console.log("No babies found");
                    setMyBabies([]); // Reset babies state if no data found
                }
                addAlert();
                setIsLoading(false); // Set loading state to false
            }, {
            });
            return () => unsubscribe();
    }, []);

    const deleteBaby = async () => {
        const babyRef = ref(database, `babies/${selectedBaby.babyID}`);

        if (selectedBaby.isCaretaker) {
            try {
                // Fetch the current baby data
                const snapshot = await get(babyRef);
                if (snapshot.exists()) {
                    const babyData = snapshot.val();
                    const currentCaretakers = selectedBaby.caretakers;
                    const updatedCaretakers = currentCaretakers.filter(id => id !== auth.currentUser.uid);
                
                    // Update the database with the new caretakers list
                    await set(babyRef, { ...babyData, caretakers: updatedCaretakers });
                    console.log("Caretaker removed successfully");
                    Alert.alert("Success", "Baby profile removed.");
                }
                else {
                    console.log("Baby not found");
                }
            } catch (error) {
                console.error("Error updating caretakers: ", error);
            }
        }
        else {
            remove(babyRef).then(() => {
                    //setMyBabies((prevBabies) => prevBabies.filter(baby => baby.babyID !== itemId));
                    console.log("baby deleted");
                }).catch((error) => {
                    console.error("Error deleting alert: ", error);
            });  
        }
    };

    const showDialog = (baby) => {
        setSelectedBaby(baby);
        setVisible(true);
    };

    const handleDelete = () => {
        deleteBaby();
        setVisible(false);
    };

    const calculateAge = (dob) => {

        const dateParts = dob.split('/');   //parse dob
        
        if (dateParts.length !== 3) {
            return "Invalid DOB"; // Return if the date format is incorrect
        }
    
        const month = parseInt(dateParts[0], 10);
        const day = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);
        const birthDate = new Date(year, month - 1, day);
    
        // Check if the date is valid
        if (isNaN(birthDate.getTime())) {
            return dob;
        }
        const currentDate = new Date(); 
        const diffInTime = currentDate - birthDate;
        const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
    
        // If the baby is less than 1 month old, return the age in days
        if (diffInDays < 30) {
            return `${diffInDays} days old`;
        } else {
            const diffInMonths = currentDate.getMonth() - birthDate.getMonth() + 
                (12 * (currentDate.getFullYear() - birthDate.getFullYear()));
            
            return `${diffInMonths} months old`;
        }
    };

    return (
      <View className="flex-1 bg-white" style={{ backgroundColor: "#cfe2f3" }}>
        <SafeAreaView className="flex">
          <View className="flex-row justify-center" style={styles.container}>
            <Text className="text-white mt-5" style={styles.titleText}>Baby Profiles</Text>
          </View>
        </SafeAreaView>
        {isLoading ? ( // Check if isLoading is true
            // Render ActivityIndicator while loading
            <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}/>
        ) : (
            <View style={styles.mainBody}>
                <View style={{ padding: 10 }}>
                    {myAlerts.length > 0 && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ShareRequests', { alerts: myAlerts })}
                            style={{ backgroundColor: '#fef9c3', padding: 10, borderRadius: 20 }}
                        >
                            <Text style={{ fontSize: 18, color: '#28436d', fontWeight: 'bold', textAlign: 'center' }}>
                                {myAlerts.length === 1
                                    ? `You have 1 share request!`
                                    : `You have ${myAlerts.length} share requests!`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                    <View style={{ padding: 10 }}>
                    {myBabies.length < 1 && (
                            <Text style={{ fontSize: 18, color: '#28436d', fontWeight: 'bold', textAlign: 'center' }}>
                                You have no baby profiles. Add one below!
                            </Text>
                        )}
                    </View>
                <FlatList
                    data={myBabies}
                    keyExtractor={item => item.babyID}
                    renderItem={({ item }) => {
                        const ageText = calculateAge(item.DOB); // convert DOB to days or months old
                        return (

                            <View className="form space-y-2 mb-8 border rounded-3xl">
                                <TouchableOpacity className="flex-row space-x-2.5" onPress={()=> navigation.navigate('HomeScreen', item)}>

                                    <View style={[ styles.circle, { backgroundColor: item.Gender === 'Male' ? '#89CFF0' : 'pink' }, ]}>
                                        <Image source={require('../assets/logo.png')} style={{ width: 150, height: 150 }}/>
                                    </View>

                                    <View style={{ borderRightWidth: 1, borderRightColor: 'black' }}></View>

                                    <View className="form space-y-2">
                                    <Text className=""></Text>
                                    <Text className=""></Text>
                                    <Text className="text-white" style={styles.nameText}>{item.fullName}</Text>
                                    <Text className="text-white" style={styles.ageText}>{ageText}</Text>
                                    </View>
                                    {!item.isCaretaker && (
                                    <TouchableOpacity style={{ position: "absolute", right: 12, top: 10 }} onPress={()=> navigation.navigate('EditBaby', item)}>
                                        <Ionicons name= "pencil" size={27} color= "grey"/>
                                    </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={{ position: "absolute", right: 12, bottom: 10 }} onPress={() => showDialog(item)}>
                                        <Ionicons name= "trash" size={27} color= "grey"/>
                                    </TouchableOpacity>
                                        <Dialog.Container visible={visible}>
                                        <Dialog.Title>Confirm Deletion</Dialog.Title>
                                        <Dialog.Description>
                                            Are you sure you want to delete {selectedBaby?.fullName}'s profile? This cannot be undone.
                                        </Dialog.Description>
                                        <Dialog.Button label="Cancel" onPress={() => setVisible(false)} />
                                        <Dialog.Button label="Delete" onPress={handleDelete} color="red" />
                                        </Dialog.Container>
                                    {!item.isCaretaker && (
                                    <TouchableOpacity style={{ position: "absolute", right: 130, bottom: 10 }} onPress={()=> navigation.navigate('ShareBaby', item)}>
                                        <Ionicons name= "share" size={27} color= "grey"/>
                                    </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )
                    }}
                />
                <TouchableOpacity className="py-1 bg-blue-300 rounded-3xl mt-6 mb-6">
                    <Text className="font-xl  text-center text-gray-700 text-3xl" onPress={()=> navigation.navigate('AddProfile')}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Settings', { alerts: myAlerts })} style={styles.settingsButton}>
            <Ionicons name="settings" size={42} color="black" />
            <Ionicons name="person" size={42} color="black" style={styles.personIcon} />
        </TouchableOpacity>
            </View>
        )}
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

    alertList: {
        borderWidth: 1, 
        borderColor: 'black', 
        borderRadius: 8, 
        padding: 10,
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
  circle: {
    width: 120,
    height: 120,
    margin: 18,
    marginRight: 10,
    borderRadius: 70,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
    settingsButton: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 10
  },
  personIcon: {
    marginLeft: -10
  }
});
