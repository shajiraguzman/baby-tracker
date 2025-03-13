import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Platform } from 'react-native';
import { ref, onValue, push } from 'firebase/database';
import { database } from '../config/firebase';
import Timeline from 'react-native-timeline-flatlist';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Define the BabyMilestones component
const BabyMilestones = ({ route }) => {
    const { fullName, babyID } = route.params;

    const [milestones, setMilestones] = useState([]); // State for storing milestones
    const [loading, setLoading] = useState(true); // Loading state
    const [modalVisible, setModalVisible] = useState(false); // State for controlling the modal visibility
    const [newTitle, setNewTitle] = useState(''); // State for new milestone title
    const [newDescription, setNewDescription] = useState(''); // State for new milestone description
    const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected date
    const [showDatePicker, setShowDatePicker] = useState(false); // State for showing the date picker
    const navigation = useNavigation();

    // Effect to fetch milestones from Firebase on component mount
    useEffect(() => {
        const milestonesRef = ref(database, `babies/${babyID}/milestone`);
        onValue(milestonesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const milestonesArray = Object.keys(data).map((key) => ({
                    milestoneId: key,
                    ...data[key],
                }));

                // Sort milestones by date
                milestonesArray.sort((a, b) => {
                    const [monthA, dayA, yearA] = a.date.split('/');
                    const [monthB, dayB, yearB] = b.date.split('/');
                    const dateA = new Date(yearA, monthA, dayA);
                    const dateB = new Date(yearB, monthB , dayB);
                
                    return dateA - dateB;
                });

                setMilestones(milestonesArray);
            } else {
                setMilestones([]); // No milestones found
            }
            setLoading(false); // Stop loading
        });
    }, [babyID]);

    // Map milestones to timeline data
    const timelineData = milestones.map((milestone) => ({
        time: milestone.date,
        title: milestone.title,
        description: milestone.description,
        onPress: () => handleMilestonePress(milestone),
    }));

    // Function to navigate to MilestoneView on milestone press
    const handleMilestonePress = (milestone) => {
        navigation.navigate('MilestoneView', { 
            milestone, 
            babyID, 
            fullName, 
            milestoneId: milestone.milestoneId,
        });
    };

    // Function to handle adding a new milestone
    const handleAddMilestone = () => {
        const newMilestoneRef = ref(database, `babies/${babyID}/milestone`);
        const newMilestone = {
            title: newTitle,
            description: newDescription,
            date: selectedDate.toLocaleDateString(), // Use the selected date
        };
        
        // Push new milestone to the database
        push(newMilestoneRef, newMilestone)
            .then(() => {
                console.log("New milestone added:", newMilestone); // Log new milestone details
                setModalVisible(false); // Close modal after saving
                setNewTitle(''); // Reset input fields
                setNewDescription('');
                setSelectedDate(new Date()); // Reset selected date
            })
            .catch((error) => {
                console.error("Error adding milestone: ", error); // Log any errors during the addition
            });
    };

    // Function to render timeline item detail
    const renderDetail = (rowData) => (
        <TouchableOpacity onPress={rowData.onPress}>
            <Text style={styles.title}>{rowData.title}</Text>
            <Text style={styles.description}>{rowData.description}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={{ height: 13 }} />
            {/* Back button to navigate to previous screen */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="#28436d" />
            </TouchableOpacity>
            <Text style={styles.title}>{fullName}'s Milestones</Text>

            {/* Add Milestone Button - Positioned above Timeline */}
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>Add Milestone</Text>
            </TouchableOpacity>

            {/* Loading indicator while fetching milestones */}
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Timeline
                    data={timelineData}
                    circleSize={20}
                    innerCircle={'dot'}
                    circleColor='rgb(45,156,219)'
                    lineColor='rgb(45,156,219)'
                    timeStyle={{textAlign: 'center', backgroundColor:'#ff9797', color:'white', padding:5, borderRadius:13}}
                    timeContainerStyle={{ minWidth: 100 }}
                    descriptionStyle={{ color: 'gray' }}
                    options={{
                        style: { paddingTop: 5 },
                        removeClippedSubviews: false
                    }}        
                    separator={true}
                    renderDetail={renderDetail}
                />
            )}

            {/* Modal for adding a new milestone */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle
                        }>Add New Milestone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            value={newTitle}
                            onChangeText={setNewTitle}
                            placeholderTextColor="#c2c2c2"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            value={newDescription}
                            onChangeText={setNewDescription}
                            placeholderTextColor="#c2c2c2"
                        />
                        {/* Date Picker */}
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <View>
                                <DateTimePicker
                                    value={selectedDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, date) => {
                                        if (Platform.OS === 'android') { // Android automatically has confirm button
                                            setShowDatePicker(false);
                                        }
                                        if (date) {
                                            setSelectedDate(date); // Set selected date from date picker
                                            console.log("Selected date:", date.toLocaleDateString()); // Log the selected date
                                        }
                                    }}
                                    textColor="black"
                                />
                                {Platform.OS === 'ios' && ( // manually add confirmation button for iOS
                                    <Button
                                        title="Done"
                                        onPress={() => {
                                            setShowDatePicker(false);
                                        }}
                                    />
                                 )}
                            </View>
                        )}
                        <Button title="Add Milestone" onPress={handleAddMilestone} />
                        <View style={{ height: Platform.OS === 'android' ? 10 : 0 }} />
                        <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                    </View>
                </View>
            </Modal>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 25,
    },
    backButton: {
        position: 'absolute',
        top: 57,
        left: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
        textAlign: 'center',
        color: "#28436d",
    },
    addButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    description: {
        color: 'gray',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    dateText: {
        fontSize: 16,
        color: '#007BFF',
        marginBottom: 15,
    },
});

export default BabyMilestones;
