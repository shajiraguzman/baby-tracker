import React from "react"
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

const Notification = ({ route, navigation }) => {
  const { fullName, notifications } = route.params

  const renderNotificationItem = ({ item }) => {
    return (
      <View style={styles.notificationItem}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.notificationDate}>{item.date}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={{ height: 13 }} />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color={"#28436d"} />
      </TouchableOpacity>
      <Text style={styles.title}>{fullName}'s Notifications</Text>
      <Text style={{ color: "white" }}>Clear Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderNotificationItem}
        />
      )}
    </View>
  )
}

// Light mode styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 25,
    backgroundColor: "#fff", // Light mode background color
  },
  backButton: {
    position: "absolute",
    top: 57,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    color: "#28436d", // Light mode title color
  },
  notificationItem: {
    backgroundColor: "#f9f9f9", // Light mode notification background
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333", // Light mode text color
  },
  notificationBody: {
    fontSize: 16,
    color: "#555", // Light mode text color
    marginVertical: 5,
  },
  notificationDate: {
    fontSize: 14,
    color: "#777", // Light mode date color
    marginTop: 5,
  },
  noNotifications: {
    textAlign: "center",
    fontSize: 18,
    color: "#555", // Light mode "no notifications" text color
    marginTop: 20,
  },
})

export default Notification
