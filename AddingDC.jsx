import { firestore } from '../config/firebase'; // Adjust the import path according to your setup

const addDiaperChange = async (babyId, notes) => {
  try {
    const changeTime = new Date(); // Using the current time as the change time
    await firestore.collection('diaperChanges').add({
      babyId,
      changeTime,
      notes,
    });
    console.log('Diaper change added successfully');
  } catch (error) {
    console.error('Error adding diaper change: ', error);
  }
};
