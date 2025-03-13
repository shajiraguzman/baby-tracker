import React, { useEffect, useMemo, useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, } from "react-native"
import { ref, push, set, query, orderByChild, onValue, remove } from "firebase/database"
import { auth, database } from "../config/firebase"
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Comments = ({ route }) => {
  const { fullName, babyID } = route.params;

  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const commentRef = ref(database, "comments/")
  const navigation = useNavigation();

  const allCommentsQuery = useMemo(
    () => query(commentRef, orderByChild('dateTime')),
    [commentRef]
  )
  
  // Retrieving Comments from DB
  useEffect(() => {
    const unsubscribe = onValue(allCommentsQuery, (snapshot) => {
      if (snapshot.exists()) {
        console.log("Comments found in DB!!!")
        let tmp = []
        snapshot.forEach((child) => {
          //console.log(child.key, child.val());
          tmp.push(child.val())
        })

        // Filter Comments based on the "babyId"
        const filteredComments = Object.values(tmp).filter(
          (comment) => comment.babyID && comment.babyID == babyID
        )
      
        // Reverse the order of filtered comments
        const reversedComments = filteredComments.reverse();
  
        // Set reversed comments to state
        setComments(reversedComments)
        
      } else {
        console.log("No Comments found")
        setComments([]) // Reset comments with empty array
      }
    })

    return () => unsubscribe()
  }, [])

  //Save comment record
  const handleSaveComment = () => {
    const newComment = {
      text: comment,
      user: auth.currentUser.email.split('@')[0],
      commentDate: new Date().toLocaleDateString(),
      dateTime: new Date().getTime(),
      babyID: babyID,
    }

    setComments([...comments, newComment])
    setComment("")
    console.log("Comment Saved!")

    createComment()
  }

  // Saves comments to the database
  function createComment() {
    const newCommentRef = push(commentRef)
    const commentKey = newCommentRef.key

    // Create the new comment entry with a uniquely generated key
    const newComment = {
      commentId: commentKey,
      text: comment,
      user: auth.currentUser.email.split('@')[0],
      commentDate: new Date().toLocaleDateString(),
      dateTime: new Date().getTime(),
      babyID: babyID,
    }

    // Set the new baby entry in the database and to catch error in case there is an error
    set(newCommentRef, newComment)
      .then(() => {
        console.log("New Comment was successfully added")
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date().getTime();
    const diff = now - timestamp;
  
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return days + (days === 1 ? " day ago" : " days ago");
    } else if (hours > 0) {
      return hours + (hours === 1 ? " hour ago" : " hours ago");
    } else if (minutes > 0) {
      return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
    } else {
      return seconds + (seconds === 1 ? " second ago" : " seconds ago");
    }
  };

  return (
    <View style={styles.container}>
    <View style={{ height: 13 }} />
      {/* Back button to navigate to previous screen */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="#28436d" />
      </TouchableOpacity>
      <Text style={styles.title}>{fullName}'s Comments</Text>

      {/* Comment Section Modal */}
        <View style={styles.commentSection}>
          {/* Comment Input Field */}
          <TextInput
            style={styles.commentInput}
            label="Add a comment"
            value={comment}
            onChangeText={(text) => setComment(text)}
            mode="outlined"
            placeholder="Add comment..."
          />
          {/* Submit Button */}
          <TouchableOpacity style={styles.commentButton} onPress={handleSaveComment}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Post</Text>
          </TouchableOpacity>
          {/* Display list of comments */}
          <FlatList
            data={comments}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                  <Text style={styles.user}>{item.user.charAt(0).toUpperCase() + item.user.slice(1)}</Text>
                  <Text style={styles.date}>{getTimeAgo(item.dateTime)}</Text>
                </View>
                <Text>{item.text}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No comments yet.</Text>}
            showsVerticalScrollIndicator={false}
          />
        </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 25,
  },
  backButton: {
    position: 'absolute',
    top: 57,
    left: 20,
    zIndex: 1,
  },
  commentButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 15,
    alignItems: 'center',
    alignSelf: 'center',
    width: 70,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: "#28436d",
  },
  user: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: 'grey',
    marginLeft: 6,
  },
  empty: {
    fontSize: 18,
    color: 'grey',
    alignSelf: 'center',
    marginTop: 170,
  },
  comment: {
    margin: 3,
    fontWeight: "bold",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#999",
    width: 320,
    alignSelf: 'center',
  },
  commentInput: {
    width: 320,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginTop: 15,
    height: 60,
    fontSize: 15,
    alignSelf: 'center',
  },
  commentSection: {
    backgroundColor: "white",
    padding: 10,
    margin: 5,
    borderRadius: 20,
    shadowColor: "#000",
    height: 700,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Comments;