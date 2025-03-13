import React, { Component, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HelpNSupport({ navigation }) {

    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleExpand = (index) => {
      setExpandedIndex(index === expandedIndex ? null : index);
    };

    const faqData = [
      {
        question: "Can I add more than one baby profile?",
        answer: "Yes, you can add and accept as many baby profiles as you want!"
      },
      {
        question: "What happens when I delete a baby profile?",
        answer: "Deleting a baby profile you created cannot be undone. This removes all logs and milestones associated with the baby profile and also deletes the profile from any shared users. If the user did not create the profile (the profile was shared with them) the delete button only removes it from your profile list. The original user still has the profile."
      },
      {
        question: "Who can I share my baby profile with?",
        answer: " Users who create a baby profile can share the profile with authorized users on Baby Tracker. If the email you type into the Share Baby screen does not have an account on Baby Tracker, they will not be able to receive the request."
      },
      
      {
        question: "Can I leave messages for people with whom I’ve shared profiles?",
        answer: "Yes, you can leave messages on the specific baby profile in the comments section. Anyone who has access to that baby profile will be able to see the comment and who posted it."
      },
      {
        question: "Will my milestones be ordered based on when I entered them?",
        answer: "No, the milestone timeline will automatically order your milestones by the achievement dates you specified."
      },
      {
        question: "If I share my baby's profile, what can the other user do?",
        answer: "If the user accepts the share request, they have regular access to the baby profile except for deleting and sharing. The shared user does not have permission to share the profile. If the shared user deletes the profile, it only removes it from their profile screen."
      },
        {
        question: "What happens when I delete a baby profile?",
        answer: "Deleting a baby profile you created cannot be undone. This removes all logs and milestones associated with the baby profile and also deletes the profile from any shared users. If the user did not create the profile (the profile was shared with them) the delete button only removes it from your profile list. The original user still has the profile."
      },
      {
        question: "Can I reset my password?",
        answer: "Yes, if a user forgets their password, they can reset it on the login screen."
      },
      // Add more questions as needed
    ];

  return (
    <View style={{ flex: 1, backgroundColor: "#cfe2f3" }}>
      {/* Top Header */}
      <View style={{ ...styles.topHeader, backgroundColor: "#cfe2f3" }}>
        <TouchableOpacity style={{ position: "absolute", left: 20, top: 25, zIndex: 1 }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="#28436d" />
        </TouchableOpacity>
        <Text style={styles.titleText}>Help & Support</Text>
      </View>

      {/* FAQ Section */}
      <View className="flex space-y-5 bg-white px-2">
        <View style={styles.container}>
          <Text style={styles.subTitle}>Frequently Asked Questions</Text>
          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity onPress={() => toggleExpand(index)}>
                <Text style={styles.question}>{faq.question}</Text>
              </TouchableOpacity>
              {expandedIndex === index && (
                <Text style={styles.answer}>{faq.answer}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    alignItems: "center",
    height: 80,
    padding: 20,
    marginTop: 40,
  },
  titleText: {
    color: '#28436d',
    fontSize: 30,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    paddingBottom: 0,
  },
  subTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  faqItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  question: {
    fontSize: 18,
    fontWeight: '500',
    color: '#007AFF',
  },
  answer: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});