import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, update, remove, get } from 'firebase/database';
import { database } from '../config/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

// Function to convert date from "MM/DD/YYYY" to "YYYY-MM-DD"
const convertToISODate = (dateString) => {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month}-${day}T00:00:00Z`; // ISO 8601 format
};

// Function to convert date from "MM/DD/YYYY" to a JavaScript Date object
const parseDateString = (dateString) => {
    const [month, day, year] = dateString.split('/');
    return new Date(year, month - 1, day); // Month is zero-based
};

// Function to convert Date object back to "MM/DD/YYYY"
const formatDateString = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

// MilestoneView component
const MilestoneView = ({ navigation, route }) => {
    const { milestone, babyID, milestoneId } = route.params;

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(milestone.title);
    const [editedDescription, setEditedDescription] = useState(milestone.description);
    const [editedDate, setEditedDate] = useState(parseDateString(milestone.date)); // Convert string to Date
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Fetch milestone data from Firebase
    const fetchMilestone = async () => {
        const milestoneRef = ref(database, `babies/${babyID}/milestone/${milestoneId}`);
        try {
            const snapshot = await get(milestoneRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                setEditedTitle(data.title);
                setEditedDescription(data.description);
                setEditedDate(parseDateString(data.date)); // Convert the fetched date string to Date object
            } else {
                console.log("No milestone data available");
            }
        } catch (error) {
            console.error("Error fetching milestone data: ", error);
        }
    };

    const handleEditPress = () => {
        setIsEditing(true);
    };

    const handleSaveChanges = async () => {
        const milestoneRef = ref(database, `babies/${babyID}/milestone/${milestoneId}`);
        try {
            await update(milestoneRef, {
                title: editedTitle,
                description: editedDescription,
                date: formatDateString(editedDate), // Save the date as "MM/DD/YYYY" format
            });
            setIsEditing(false);
            await fetchMilestone(); // Fetch the updated milestone
        } catch (error) {
            console.error("Error updating milestone: ", error);
        }
    };

    const handleDeleteMilestone = () => {
        Alert.alert(
            "Delete Milestone?",
            "This will permanently delete the current milestone",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: deleteMilestone, style: "destructive" },
            ],
            { cancelable: true }
        );
    };

    const deleteMilestone = async () => {
        const milestoneRef = ref(database, `babies/${babyID}/milestone/${milestoneId}`);
        try {
            await remove(milestoneRef);
            navigation.goBack();
        } catch (error) {
            console.error("Error deleting milestone: ", error);
        }
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || editedDate;
        setShowDatePicker(false);
        setEditedDate(currentDate); // Update the editedDate state
    };

    useEffect(() => {
        fetchMilestone(); // Fetch milestone data on mount
    }, []);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                <Ionicons name="create-outline" size={30} color="black" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.label}>Title:</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={editedTitle}
                            onChangeText={setEditedTitle}
                        />
                    ) : (
                        <Text style={styles.value}>{editedTitle}</Text>
                    )}
                </View>
                
                <View style={styles.titleContainer}>
                    <Text style={styles.label}>Description:</Text>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={editedDescription}
                            onChangeText={setEditedDescription}
                        />
                    ) : (
                        <Text style={styles.value}>{editedDescription}</Text>
                    )}
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.label}>Date:</Text>
                    {isEditing ? (
                        Platform.OS === 'android' ? (
                        <>
                            {!showDatePicker && (
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                <Text style={styles.date}>{editedDate.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            )}
                            {showDatePicker && (
                            <DateTimePicker
                                value={editedDate}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                            )}
                        </>
                        ) : (
                        <DateTimePicker
                            value={editedDate}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                        )
                    ) : (
                        <Text style={styles.value}>{editedDate.toLocaleDateString()}</Text>
                    )}
                </View>

                {isEditing && (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteMilestone}>
                    <Text style={styles.deleteButtonText}>Delete Milestone</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 25,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
    editButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    scrollContainer: {
        paddingBottom: 100,
        marginTop: 60,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 18,
        paddingRight: 10,
        paddingLeft: 10,
        width: '70%',
        textAlign: 'right',
    },
    date: {
        fontSize: 18,
        paddingRight: 10,
        paddingLeft: 10,
        textAlign: 'right',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 5,
        width: '60%',
        paddingRight: 10,
        borderRadius: 10,
    },
    saveButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default MilestoneView;
