import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, Text } from 'react-native';

const DiaperChangeTracker = ({ babyId }) => {
  const [notes, setNotes] = useState('');
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    const fetchChanges = async () => {
      const fetchedChanges = await getDiaperChanges(babyId);
      setChanges(fetchedChanges);
    };

    fetchChanges();
  }, [babyId]);

  const handleAddChange = async () => {
    await addDiaperChange(babyId, notes);
    setNotes('');
    // Optionally, fetch the updated list of changes here
  };

  return (
    <View>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes about the diaper change"
      />
      <Button
        title="Add Diaper Change"
        onPress={handleAddChange}
      />
      <Text>Total Changes: {changes.length}</Text>
      {/* Display a list of changes if needed */}
    </View>
  );
};
