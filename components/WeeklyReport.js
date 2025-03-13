import React, { useEffect, useState, useCallback } from "react"
import {
  Text,
  View,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button,
} from "react-native"
import { ref, onValue, query, orderByChild } from "firebase/database"
import { database } from "../config/firebase"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import * as Notifications from "expo-notifications"

const getLastWeekDates = () => {
  const currentDate = new Date()
  const lastWeekDates = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate)
    date.setDate(currentDate.getDate() - i)

    const month = (date.getMonth() + 1).toString()
    const day = date.getDate().toString()
    const year = date.getFullYear().toString()

    const formattedDate = `${month}/${day}/${year}`

    lastWeekDates.push({
      date,
      label: formattedDate,
      dayName: date.toLocaleString("default", { weekday: "long" }),
    })
  }

  return lastWeekDates.reverse()
}

const formatTimestampToMMDDYY = (timestamp) => {
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

function convertTimestamp(timestamp) {
  const date = new Date(timestamp)
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }
  return date.toLocaleString("en-US", options)
}

const isDateEqual = (date1, date2) => {
  const [day1, month1, year1] = date1.split("/").map(Number)
  const [day2, month2, year2] = date2.split("/").map(Number)

  return (
    (day1 === day2 && month1 === month2 && year1 === year2) ||
    (day1 === month2 && month1 === day2 && year1 === year2)
  )
}

const WeeklyReport = ({ route }) => {
  const { fullName, babyID } = route.params
  const [dailyReports, setDailyReports] = useState([])
  const [feedings, setFeedings] = useState([])
  const [diaperChanges, setDiaperChanges] = useState([])
  const [sleepRecords, setSleepRecords] = useState([])
  const [comments, setComments] = useState([])

  const navigation = useNavigation()

  const feedingTimeRef = ref(database, "feedingTimes/")
  const diaperChangeRef = ref(database, "diaperChanges/")
  const sleepTimeRef = ref(database, "sleepTimes/")
  const commentRef = ref(database, "comments/")

  async function scheduleWeeklyNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Weekly Report Ready 📋",
          body: "Your child's weekly report is ready!",
          sound: "default",
          data: { screen: "WeeklyReport" },
        },
        trigger: {
          weekday: 7,
          hour: 9,
          minute: 0,
          repeats: true,
        },
      })
      Alert.alert(
        "Notification Scheduled",
        "Weekly report notification set for every Sunday at 9:00 AM."
      )
    } catch (error) {
      console.error("Error scheduling notification:", error)
      Alert.alert("Error", "Failed to schedule notification.")
    }
  }

  const fetchData = useCallback(() => {
    const allFeedingTimesQuery = query(feedingTimeRef, orderByChild("dateTime"))
    onValue(allFeedingTimesQuery, (snapshot) => {
      if (snapshot.exists()) {
        const feedingsArray = Object.values(snapshot.val()).filter(
          (feeding) => feeding.babyID === babyID
        )
        setFeedings(feedingsArray)
      } else {
        setFeedings([])
      }
    })

    onValue(diaperChangeRef, (snapshot) => {
      if (snapshot.exists()) {
        const diaperChangesArray = Object.values(snapshot.val()).filter(
          (change) => change.babyID === babyID
        )
        setDiaperChanges(diaperChangesArray)
      } else {
        setDiaperChanges([])
      }
    })

    onValue(sleepTimeRef, (snapshot) => {
      if (snapshot.exists()) {
        const sleepArray = Object.values(snapshot.val()).filter(
          (sleep) => sleep.babyID === babyID
        )
        setSleepRecords(sleepArray)
      } else {
        setSleepRecords([])
      }
    })
    onValue(commentRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsArray = Object.values(snapshot.val()).filter(
          (comment) => comment.babyID === babyID
        )
        setComments(commentsArray)
      } else {
        setComments([])
      }
    })
  }, [babyID])

  const prepareDailyReports = useCallback(() => {
    const lastWeekDates = getLastWeekDates()

    const reports = lastWeekDates.map((day) => ({
      date: day.label,
      dayName: day.dayName,
      feeding: feedings.filter((f) => isDateEqual(f.feedingDate, day.label)),
      diapers: diaperChanges.filter((d) => isDateEqual(d.date, day.label)),
      sleep: sleepRecords.filter(
        (s) =>
          isDateEqual(formatTimestampToMMDDYY(s.sleepStart), day.label) ||
          isDateEqual(formatTimestampToMMDDYY(s.sleepEnd), day.label)
      ),
      comments: comments.filter((c) => isDateEqual(c.commentDate, day.label)),
    }))

    setDailyReports(reports)
  }, [feedings, diaperChanges, sleepRecords])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    prepareDailyReports()
  }, [feedings, diaperChanges, sleepRecords, prepareDailyReports])

  return (
    <View style={styles.container}>
      <View style={{ height: 13 }} />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color="#28436d" />
      </TouchableOpacity>
      <Text style={styles.title}>{fullName}'s Weekly Report</Text>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {dailyReports.map((day, index) => (
          <View key={index} style={styles.dayContainer}>
            <Text
              style={styles.dayTitle}
            >{`${day.dayName}, ${day.date}`}</Text>

            <Text style={styles.dayDetail}>
              <Text style={styles.daySubtitle}>Feeding: </Text>
              {day.feeding.length > 0 ? (
                day.feeding.map((el, idx) => (
                  <Text key={idx}>
                    {"\n"}⦿ {el.foodChoice} {el.feedingAmount} ml at{" "}
                    {el.feedingTime}
                  </Text>
                ))
              ) : (
                <Text> No feeding data {"\n"}</Text>
              )}
            </Text>

            <Text style={styles.dayDetail}>
              <Text style={styles.daySubtitle}>Sleep Records: </Text>
              {day.sleep.length > 0 ? (
                day.sleep.map((el, idx) => (
                  <Text key={idx}>
                    {"\n"}⦿
                    {` Slept from ${convertTimestamp(
                      el.sleepStart
                    )} to ${convertTimestamp(el.sleepEnd)}`}
                  </Text>
                ))
              ) : (
                <Text> No sleep data {"\n"}</Text>
              )}
            </Text>

            <Text style={styles.dayDetail}>
              <Text style={styles.daySubtitle}>Diaper Changes: </Text>
              {day.diapers.length > 0 ? (
                day.diapers.map((el, idx) => (
                  <Text key={idx}>
                    {"\n"}⦿ {el.type} at {el.time}
                  </Text>
                ))
              ) : (
                <Text> No diaper change data {"\n"}</Text>
              )}
            </Text>

            <Text style={styles.dayDetail}>
              <Text style={styles.daySubtitle}>Comments: </Text>
              {day.comments.length > 0 ? (
                day.comments.map((el, idx) => (
                  <Text key={idx}>
                    {"\n"}⦿
                    {` ${el.user.charAt(0).toUpperCase() + el.user.slice(1)} commented "${el.text}" at ${convertTimestamp(
                      el.dateTime
                    )}`}
                  </Text>
                ))
              ) : (
                <Text> No Comment data</Text>
              )}
            </Text>
          </View>
        ))}
      </ScrollView>
      <Button
        title="Schedule Weekly Notification"
        onPress={scheduleWeeklyNotification}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f5f7",
    padding: 20,
    paddingTop: 25,
  },
  scrollContainer: {
    marginVertical: 20,
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
    color: "#28436d",
    marginTop: 20,
    textAlign: "center",
    paddingLeft: 20,
  },
  dayContainer: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
  },
  daySubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },
  dayDetail: {
    fontSize: 16,
    color: "#444",
    marginTop: 5,
  },
})

export default WeeklyReport
