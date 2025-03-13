// Imports
import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Modal, Switch, ScrollView } from 'react-native';
import { auth } from '../config/firebase';
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";


 // Navigates to login Screen
const Settings = ({ route, navigation }) => {
 
    const [alerts, setAlerts] = useState(route.params?.alerts || null);//const [alerts, setAlerts] = useState(route.params.alerts);
    const [modalVisible, setModalVisible] = useState(false);
    const [appearanceModalVisible, setAppearanceModalVisible] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleLogout = () => {
        auth.signOut().then(() => {
            navigation.navigate('Login');
        }).catch((error) => {
            console.error(error);
        });
    };

    // Placeholder functions for other buttons
    const handleAccount = () => {
        console.log('Account clicked');
    };

    const handleNotifications = () => {
         setModalVisible(true);
    };

    const handleAppearance = () => {
        setAppearanceModalVisible(true);
    };


    /*const handleHelpSupport = () => {
        console.log('Help & Support clicked');
    };*/

    const handleAbout = () => {
        console.log('About clicked');
    };

    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const toggleDarkMode = () => setIsDarkMode(previousState => !previousState);
 
    return (
        <View style={{ flex: 1, backgroundColor: "#cfe2f3" }}>
            {/* Top Header */}
            <View style={{ ...styles.topHeader, backgroundColor: "#cfe2f3" }}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Profiles")}>
                    <Ionicons name="arrow-back" size={30} color="#28436d" />
                </TouchableOpacity>
                <Text style={styles.titleText}>Settings</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView automaticallyAdjustKeyboardInsets={true} style={{ backgroundColor: "white" }}>
                <View className="flex space-y-5 bg-white px-2">
                    <View style={styles.container}>
                        {/* Account Button */}
                        <TouchableOpacity onPress={() => navigation.navigate('AccountDetails')} style={styles.button}>
                            <View style={styles.buttonContent}>
                                <Ionicons name="person" size={38} color="#262f40" />
                                <Text style={styles.buttonText}>Account</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ height: 1.5, backgroundColor: "#b5b5b5" }} />
                        
                        {/* Notifications Button */}
                        <TouchableOpacity onPress={handleNotifications} style={styles.button}>
                            <View style={styles.buttonContent}>
                                <Ionicons name="notifications" size={38} color="#262f40" />
                                <Text style={styles.buttonText}>Notifications</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ height: 1.5, backgroundColor: "#b5b5b5" }} />
                        
                        {/* Appearance */}
                        <TouchableOpacity onPress={handleAppearance} style={styles.button}>
                            <View style={styles.buttonContent}>
                                <Ionicons name="color-palette" size={38} color="#262f40" />
                                <Text style={styles.buttonText}>Appearance</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ height: 1.5, backgroundColor: "#b5b5b5" }} />

                        {/* Pending Share Request Button */}
                        <TouchableOpacity onPress={() => navigation.navigate('ShareRequests')} style={styles.button}>
                            <View style={styles.buttonContent}>
                                <Ionicons name="share" size={38} color="#262f40" />
                                <Text style={styles.buttonText}>Pending Share Requests</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ height: 1.5, backgroundColor: "#b5b5b5" }} />
                        
                        {/* Help & Support Button */}
                        <TouchableOpacity onPress={() => navigation.navigate('HelpNSupport', { alerts })}  style={styles.button}>
                            <View style={styles.buttonContent}>
                                <Ionicons name="help-circle" size={38} color="#262f40" />
                                <Text style={styles.buttonText}>Help & Support</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ height: 1.5, backgroundColor: "#b5b5b5" }} />
                        
                        {/* About Button */}
                        <TouchableOpacity onPress={() => navigation.navigate('About', { alerts })} style={styles.button}>
                            <View style={styles.buttonContent}>
                                <Ionicons name="information-circle" size={38} color="#262f40" />
                                <Text style={styles.buttonText}>About</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ height: 1.5, backgroundColor: "#b5b5b5" }} />

                        {/* Sign Out Button */}
                        <TouchableOpacity onPress={handleLogout} style={styles.button}>
                            <View style={styles.buttonContent}>
                                <Ionicons name="log-out" size={38} color="#262f40" />
                                <Text style={styles.buttonText}>Sign out</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Notification Modal */}
                        <Modal
                            transparent={true}
                            animationType="slide"
                            visible={modalVisible}
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.modalBackground}>
                                <View style={styles.modalContainer}>
                                    <Text style={styles.modalTitle}>Alert Notifications</Text>
                                    <View style={styles.switchContainer}>
                                        <Text>{isEnabled ? "Enabled" : "Disabled"}</Text>
                                        <Switch
                                            trackColor={{ false: "#767577", true: "#cfe2f3" }}
                                            thumbColor={isEnabled ? "black" : "black"}
                                            onValueChange={toggleSwitch}
                                            value={isEnabled}
                                        />
                                    </View>
                                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

                        {/* Appearance Modal */}
                        <Modal
                            transparent={true}
                            animationType="slide"
                            visible={appearanceModalVisible}
                            onRequestClose={() => setAppearanceModalVisible(false)}
                        >
                            <View style={styles.modalBackground}>
                                <View style={styles.modalContainer}>
                                    <Text style={styles.modalTitle}>Appearance</Text>
                                    <View style={styles.switchContainer}>
                                        <Text>{isDarkMode ? "Dark Mode" : "Light Mode"}</Text>
                                        <Switch
                                            trackColor={{ false: "#767577", true: "#cfe2f3" }}
                                            thumbColor={isDarkMode ? "black" : "black"}
                                            onValueChange={toggleDarkMode}
                                            value={isDarkMode}
                                        />
                                    </View>
                                    <TouchableOpacity style={styles.closeButton} onPress={() => setAppearanceModalVisible(false)}>
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

// Style Sheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        padding: 20,
    },
    topHeader: {
      alignItems: "center",
      height: 80,
      padding: 20,
      marginTop: 40,
    },
    backButton: {
      position: "absolute",
      left: 20,
      top: 25,
      zIndex: 1,
    },
    titleText: {
        color: '#28436d',
        fontSize: 35,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        paddingVertical: 18,
        width: '100%',
        alignItems: 'flex-start',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontSize: 25,
        marginLeft: 12,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    switchContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: "#cfe2f3",
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "black",
        fontWeight: "bold",
    },
});

export default Settings;