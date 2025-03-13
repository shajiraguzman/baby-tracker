const getDiaperChanges = async (babyId) => {
  try {
    const snapshot = await firestore.collection('diaperChanges')
      .where('babyId', '==', babyId)
      .get();

    const diaperChanges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return diaperChanges;
  } catch (error) {
    console.error('Error fetching diaper changes: ', error);
    return [];
  }
};
