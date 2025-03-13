import React, { useState, useMemo, useEffect } from "react"
import { Button, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Platform } from "react-native"
import { SafeAreaView, withSafeAreaInsets, } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import {
  ref,
  push,
  set,
  query,
  orderByChild,
  onValue,
  remove,
  get,
} from "firebase/database"
import { auth, database } from "../config/firebase"
import { Picker } from "@react-native-picker/picker"
import * as Notifications from "expo-notifications"

export default function HomeScreen({ route, navigation }) {
  // States
  const [newTodo, setNewTodo] = useState("")
  const [sendNotification, setSendNotification] = useState(false)
  const [todoItems, setTodoItems] = useState([])
  const [feedings, setFeedings] = useState([])
  const [diaperChanges, setDiaperChanges] = useState([])
  const [sleepRecords, setSleepRecords] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [feedingAmount, setFeedingAmount] = useState("")
  const [foodChoice, setFoodChoice] = useState("")
  const [diaperType, setDiaperType] = useState("Wet")
  const [feedingModalVisible, setFeedingModalVisible] = useState(false)
  const [diaperModalVisible, setDiaperModalVisible] = useState(false)
  const [sleepModalVisible, setSleepModalVisible] = useState(false)
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false)
  const [isStartPickerVisible, setStartPickerVisibility] = useState(false)
  const [isEndPickerVisible, setEndPickerVisibility] = useState(false)
  const [sleepStart, setSleepStart] = useState(new Date())
  const [sleepEnd, setSleepEnd] = useState(new Date())
  const [feedingNotification, setFeedingNotification] = useState(false)
  const [sleepNotification, setSleepNotification] = useState(false)
  const [diaperChangeNotification, setDiaperChangeNotification] =
    useState(false)
  const [notifications, setNotifications] = useState([])
  const feedingTimeRef = ref(database, "feedingTimes/")
  const sleepTimeRef = ref(database, "sleepTimes/")
  const diaperChangeRef = ref(database, "diaperChanges/")
  const userId = auth.currentUser.uid
  const todoItemsRef = ref(database, `todoItems/${userId}/${babyID}/`)
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [avatarColor, setAvatarColor] = useState("#ccc");
  const colorOptions = ["red", "orange", "#ffea03", "#77DD77",  "#89CFF0", "#1645de", "#c0adff", "pink", "black"];
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  const [isLoading, setIsLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)

  function containsTime(str) {
    const timeRegex =
      /\b(?:1[0-2]|[1-9]):[0-5][0-9](?:\s?[APap][Mm])?\b|\b(?:[01]?[0-9]|2[0-3]):[0-5][0-9]\b/
    return timeRegex.test(str)
  }
  const formatTime = (date) => {
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const period = hours >= 12 ? "PM" : "AM"

    hours = hours % 12 || 12

    return `${hours}:${minutes} ${period}`
  }

  const extractTimeAndScheduleNotification = async (todo) => {
    const timeMatch = todo.body.match(/\b(\d{1,2}:\d{2})(\s?[APap][Mm])?\b/)
    if (!timeMatch) {
      console.error("No valid time found in the todo body.")
      return
    }

    const time = timeMatch[1]
    const period = timeMatch[2]?.toUpperCase()?.trim() || ""

    const [hour, minute] = time.split(":").map(Number)

    const now = new Date()
    let notificationHour = hour

    if (period === "PM" && hour < 12) {
      notificationHour += 12
    } else if (period === "AM" && hour === 12) {
      notificationHour = 0
    }

    const notificationTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      notificationHour,
      minute,
      0,
      0
    )

    if (notificationTime <= now) {
      return
    }

    const quoteMatch = todo.body.match(/"([^"]+)"/)
    const notificationBody = quoteMatch ? quoteMatch[1] : todo.body

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder",
          body: notificationBody,
          sound: "default",
        },
        trigger: notificationTime,
      })
      console.log(`Notification scheduled for ${notificationTime}`)
    } catch (error) {
      console.error("Failed to schedule notification:", error)
    }
  }

  useEffect(() => {
    const filterTodos = (notifications) =>
      notifications.filter((notification) =>
        notification.title.includes("New Todo")
      )
    filterTodos(notifications).forEach((todo) =>
      extractTimeAndScheduleNotification(todo)
    )
  }, [notifications])

  const removeNotificationsFunc = () => {
    setNotifications([])
    setModalVisible(false)
  }

  const addNotification = (title, body) => {
    const newNotification = {
      id: new Date().getTime(),
      title,
      body,
      date: new Date().toLocaleString(),
    }

    const updatedNotifications = [...notifications, newNotification]
    setNotifications(updatedNotifications)
  }

  const { fullName, babyID } = route.params // Get baby info from navigation params

  // Fetching existing feeding records
  const allFeedingTimesQuery = useMemo(
    () => query(feedingTimeRef, orderByChild("dateTime")),
    [feedingTimeRef]
  )

  useEffect(() => {
    const unsubscribe = onValue(allFeedingTimesQuery, (snapshot) => {
      if (snapshot.exists()) {
        console.log("Feeding Times Found!!!")
        let tmp = []
        snapshot.forEach((child) => {
          //console.log(child.key, child.val());
          tmp.push(child.val())
        })

        // Filter feedingTimes based on the "babyId"
        const filteredFeedingTimes = Object.values(tmp).filter(
          (feedingTime) => feedingTime.babyID && feedingTime.babyID == babyID
        )
        // Set filtered feedingTimes to state
        setFeedings(filteredFeedingTimes)
        //console.log(filteredFeedingTimes);
      } else {
        console.log("No feedingTimes found")
        setFeedings([]) // Reset feedings with empty array
      }
      setIsLoading(false) // Set loading state to false
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (sendNotification) {
      const notificationBody = `Your new todo "${newTodo}" has been added!`

      Notifications.scheduleNotificationAsync({
        content: {
          title: "New Todo Added 📝",
          body: notificationBody, 
          sound: "default",
        },
        trigger: null,
      })
      if (containsTime(newTodo)) {
        addNotification("New Todo Added 📝", notificationBody)
        setNewTodo("")
      }else{
        setNewTodo("")
      }
    }
    return () => setSendNotification(false)
  }, [sendNotification, newTodo])

  useEffect(() => {
    if (feedingNotification) {
      const notificationBody = `${feedingAmount}ml of ${foodChoice} fed to the baby`
      Notifications.scheduleNotificationAsync({
        content: {
          title: "New Feeding Added",
          body: notificationBody,
          sound: "default",
        },
        trigger: null,
      })
      addNotification("New Feeding Added", notificationBody)
    }
    return () => setFeedingNotification(false)
  }, [feedingNotification])

  useEffect(() => {
    if (diaperChangeNotification) {
      const notificationBody = `Diaper of type ${diaperType} has been changed!`
      Notifications.scheduleNotificationAsync({
        content: {
          title: "New Diaper Changed",
          body: notificationBody,
          sound: "default",
        },
        trigger: null,
      })
      addNotification("New Diaper Changed", notificationBody)
    }
    return () => setDiaperChangeNotification(false)
  }, [diaperChangeNotification])

  useEffect(() => {
    if (sleepNotification) {
      const notificationBody = `Sleep from  ${formatTime(
        sleepStart
      )} to  ${formatTime(sleepEnd)} has been recorded`
      Notifications.scheduleNotificationAsync({
        content: {
          title: "New Sleep Data added",
          body: notificationBody,
          sound: "default",
        },
        trigger: null,
      })
      addNotification("New Sleep Data added", notificationBody)
    }
    return () => setSleepNotification(false)
  }, [sleepNotification])

  useEffect(() => {
    const unsubscribe = onValue(diaperChangeRef, (snapshot) => {
      if (snapshot.exists()) {
        const diaperChanges = Object.values(snapshot.val()).filter(
          (change) => change.babyID === babyID
        )
        setDiaperChanges(diaperChanges)
      } else {
        console.log("No diaper changes found")
        setDiaperChanges([])
      }
    })

    return () => unsubscribe()
  }, [babyID])

  useEffect(() => {
    const sleepTimesRef = ref(database, "sleepTimes/")
    const sleepQuery = query(sleepTimesRef, orderByChild("babyID"))

    const unsubscribe = onValue(sleepQuery, (snapshot) => {
      const fetchedSleepRecords = []
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().babyID === babyID) {
          fetchedSleepRecords.push(childSnapshot.val())
        }
      })
      setSleepRecords(fetchedSleepRecords)
    })

    return () => unsubscribe()
  }, [babyID])

  // Fetching existing todo items
  useEffect(() => {
    const todoRef = ref(database, `todoItems/${babyID}/users/${userId}/`)
    const unsubscribe = onValue(todoRef, (snapshot) => {
      if (snapshot.exists()) {
        const items = []
        snapshot.forEach((child) => {
          items.push({ id: child.key, ...child.val() })
        })
        setTodoItems(items)
      } else {
        setTodoItems([])
      }
    })

    return () => unsubscribe()
  }, [userId, babyID])

  // Function to add a todo item
  const addTodoItem = async () => {
    if (!newTodo.trim()) return

    try {
      const todoRef = ref(database, `todoItems/${babyID}/users/${userId}/`)
      const newTodoRef = push(todoRef)
      await set(newTodoRef, {
        text: newTodo,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error("Error adding Todo Item: ", error)
    }
    setSendNotification(true)
  }

  // Function to delete a todo item
  const deleteTodoItem = (itemId) => {
    const itemRef = ref(
      database,
      `todoItems/${babyID}/users/${userId}/${itemId}`
    )
    remove(itemRef).catch((error) => {
      console.error("Error deleting todo:", error)
    })
  }

  // Handle date change
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date
    setSelectedDate(currentDate)
    setDatePickerVisibility(false)
  }

  // Handle time change
  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time
    setSelectedTime(currentTime)
    setTimePickerVisibility(false)
  }

  const onChangeSleepStartDate = (event, selectedDate) => {
    const currentDate = selectedDate || sleepStart;
    setSleepStart(currentDate);
    setStartDatePickerVisibility(false);
  };

  const onChangeSleepStartTime = (event, selectedTime) => {
    const currentTime = selectedTime || sleepStart
    setSleepStart(
      (prevDate) =>
        new Date(
          prevDate.getFullYear(),
          prevDate.getMonth(),
          prevDate.getDate(),
          currentTime.getHours(),
          currentTime.getMinutes()
        )
    )
    setStartTimePickerVisibility(false)
  }

  const onChangeSleepEndDate = (event, selectedDate) => {
    const currentDate = selectedDate || sleepEnd
    setSleepEnd(currentDate)
    setEndDatePickerVisibility(false)
  }

  const onChangeSleepEndTime = (event, selectedTime) => {
    const currentTime = selectedTime || sleepEnd
    setSleepEnd(
      (prevDate) =>
        new Date(
          prevDate.getFullYear(),
          prevDate.getMonth(),
          prevDate.getDate(),
          currentTime.getHours(),
          currentTime.getMinutes()
        )
    )
    setEndTimePickerVisibility(false)
  }

  // Save feeding record
  const handleSaveFeeding = () => {
    const newFeeding = {
      feedingAmount: Number(feedingAmount),
      feedingDate: selectedDate.toLocaleDateString(),
      feedingTime: Platform.OS === 'ios' ? selectedDate.toLocaleTimeString() : selectedTime.toLocaleTimeString(), // Use selectedTime for Android
      dateTime: selectedDate.getTime(),
      babyID: babyID,
      foodChoice: foodChoice,
    }
    setFeedings([...feedings, newFeeding])
    setFeedingModalVisible(false)
    createFeedingTime()
  }

  // Saves feeding times to the database
  function createFeedingTime() {
    const newfeedingTimeRef = push(feedingTimeRef)
    const feedingTimeKey = newfeedingTimeRef.key

    // Create the new feeding time entry with a uniquely generated key
    const newfeedingTime = {
      feedingTimeID: feedingTimeKey,
      feedingAmount: Number(feedingAmount),
      feedingDate: selectedDate.toLocaleDateString(),
      feedingTime: Platform.OS === 'ios' ? selectedDate.toLocaleTimeString() : selectedTime.toLocaleTimeString(), // Use selectedTime for Android
      dateTime: selectedDate.getTime(),
      babyID: babyID,
      foodChoice: foodChoice,
    }

    // Set the new baby entry in the database and to catch error in case there is an error
    set(newfeedingTimeRef, newfeedingTime)
      .then(() => {
        console.log("Feeding Time was successfully added")
      })
      .catch((error) => {
        console.log(error)
      })
    setFeedingNotification(true)
  }

  // Save diaper change record
  const handleSaveDiaperChange = () => {
    const newDiaperChange = {
      date: selectedDate.toLocaleDateString(),
      time: Platform.OS === 'ios' ? selectedDate.toLocaleTimeString() : selectedTime.toLocaleTimeString(), // Use selectedTime for Android
      type: diaperType,
      babyID: babyID, // Include the babyID
    }

    setDiaperChanges([...diaperChanges, newDiaperChange]) // Update local state

    // Push to Firebase
    const newDiaperChangeRef = push(diaperChangeRef)
    set(newDiaperChangeRef, newDiaperChange)
      .then(() => {
        console.log("Diaper change saved to Firebase")
      })
      .catch((error) => {
        console.error("Error saving diaper change: ", error)
      })

    setDiaperModalVisible(false) // Close the modal after saving
    setDiaperChangeNotification(true)
  }

  // Save sleep record
  const handleSaveSleep = () => {
    const newSleepRecord = {
      sleepStart: sleepStart.getTime(),
      sleepEnd: sleepEnd.getTime(),
      babyID: babyID,
    }

    setSleepRecords([...sleepRecords, newSleepRecord])
    setSleepModalVisible(false)

    createSleepTime(newSleepRecord)
  }

  function createSleepTime(sleepData) {
    const newSleepTimeRef = push(sleepTimeRef)
    const sleepTimeKey = newSleepTimeRef.key

    const newSleepTime = {
      ...sleepData,
      sleepTimeID: sleepTimeKey,
    }

    // Push the new record to Firebase
    set(newSleepTimeRef, newSleepTime)
      .then(() => {
        console.log("Sleep Time was successfully added")
      })
      .catch((error) => {
        console.error("Error saving sleep time: ", error)
      })
    setSleepNotification(true)
  }

  // Function to delete a sleep record
  const handleDeleteSleep = async (recordId) => {
    try {
      const sleepRecordRef = ref(database, `sleepTimes/${recordId}`)
      await remove(sleepRecordRef)

      setSleepRecords(
        sleepRecords.filter((record) => record.sleepTimeID !== recordId)
      )
      alert("Sleep record deleted successfully!")
    } catch (error) {
      console.error("Error deleting sleep record:", error)
      alert("Failed to delete sleep record.")
    }
  }

  // Function to calculate the sleep duration
  function getSleepDuration(time1, time2) {
    // if time2 is earlier than time1, assume time2 is in the future
    if (time2 < time1) {
      time2 += 24 * 60 * 60 * 1000; // add 24 hours in milliseconds
    }
    const diffInMs = time2 - time1
    const diffInMins = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

    if (diffInHours >= 1) {
      // at least an hour ago
      const mins = diffInMins % 60
      return `${diffInHours}h ${mins}m`
    } else {
      return `${diffInMins}m`
    }
  }

  // Function to calculate the time difference for last data entries
  function getTimeAgo(date, time) {
    // Split date and time
    const [month, day, year] = date.split("/")
    const [clock, period] = time.split(" ")
    let [hoursStr, minutes, seconds] = clock.split(":")

    // Convert to 24-hour format
    let hours = parseInt(hoursStr)
    if (period === "PM" && hours !== 12) {
      hours += 12
    }
    if (period === "AM" && hours === 12) {
      hours = 0
    }

    // Convert to ISO string format (YYYY-MM-DDTHH:mm:ss)
    const isoString = `${year}-${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}T${hours.toString().padStart(2, "0")}:${minutes}:${seconds}`

    // Get time difference
    lastTime = new Date(isoString).getTime()
    currentTime = Date.now()
    diffInMs = currentTime - lastTime
    // if the difference is negative, assume lastTime was from the previous day
    if (diffInMs < 0) {
      lastTime -= 24 * 60 * 60 * 1000; // subtract 24 hours in milliseconds
      diffInMs = currentTime - lastTime; // recalculate the difference
    }
    const diffInMins = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays >= 1) {
      // at least a day ago
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
    } else if (diffInHours >= 1) {
      // at least an hour ago
      const mins = diffInMins % 60
      return `${diffInHours}h ${mins}m ago`
    } else {
      return `${diffInMins}m ago`
    }
  }

  useEffect(() => {
    const fetchAvatarColor = async () => {
      try {
        const avatarRef = ref(database, `avatarColors/${babyID}`)
        const snapshot = await get(avatarRef)
        if (snapshot.exists()) {
          const data = snapshot.val()
          if (data.avatarColor) {
            setAvatarColor(data.avatarColor)
          }
        }
      } catch (error) {
        console.error("Error fetching avatar color: ", error)
      }
    }

    fetchAvatarColor()
  }, [babyID])

  const updateAvatarColor = async (color) => {
    try {
      setAvatarColor(color)
      const avatarRef = ref(database, `avatarColors/${babyID}`)
      await set(avatarRef, { avatarColor: color })
      console.log("Color updated successfully")
    } catch (error) {
      console.error("Error updating color: ", error)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#cfe2f3" }}>
      {/* Top Header */}
      <View style={{ ...styles.topHeader, backgroundColor: "#cfe2f3" }}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Profiles")}
        >
          <Ionicons name="arrow-back" size={30} color="#28436d" />
        </TouchableOpacity>

        <Text style={styles.titleText}>Activity Log</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView automaticallyAdjustKeyboardInsets={true} style={{ backgroundColor: "white" }}>
        <View className="flex space-y-5 bg-white px-4 pt-6">
          <View style={styles.profileSection}>
            {/* Avatar Section */}
            <View className="flex justify-center" style={{ marginLeft: 20 }}>
              <TouchableOpacity
                style={[styles.avatarBubble, { backgroundColor: avatarColor }]}
                onPress={() => setColorModalVisible(true)}
              >
                <Image source={require('../assets/babyIcon.png')} style={{ tintColor: 'white', marginLeft: 0, width: 80, height: 80 }}/>
              </TouchableOpacity>
              <Text style={styles.nameText}>{fullName}</Text>
            </View>

            {/* To-Do List */}
            <View style={styles.todoList}>
              <TouchableOpacity
                style={{ backgroundColor: "#cfe2f3", padding: 5 }}
                onPress={addTodoItem}
              >
                <Text style={styles.todoButtonText}>Add Todo</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.todoInput}
                value={newTodo}
                onChangeText={setNewTodo}
                placeholder="Enter todo item"
              />
              {todoItems.map((todo) => (
                <View key={todo.id} style={styles.todoItemContainer}>
                  <Text style={styles.todoItem}>• {todo.text}</Text>
                  <TouchableOpacity onPress={() => deleteTodoItem(todo.id)}>
                    <Ionicons name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 1.5, backgroundColor: "grey" }} />

          {/* Feeding Button */}
          <TouchableOpacity
            className="flex-row space-x-7"
            style={[styles.dataButton, { backgroundColor: "#fd763e" }]}
            onPress={() => setFeedingModalVisible(true)}
          >
            <Image
              source={require("../assets/feedingIcon.png")}
              style={[styles.dataIcon, { tintColor: "#e64d14" }]}
            />

            <View className="flex-1">
              <Text style={styles.dataText}>Feeding</Text>
              {feedings.length > 0 && (
                <Text style={[styles.recordPreview]}>
                  {getTimeAgo(
                    feedings[feedings.length - 1].feedingDate,
                    feedings[feedings.length - 1].feedingTime
                  )}{" "}
                  • {feedings[feedings.length - 1].foodChoice} (
                  {feedings[feedings.length - 1].feedingAmount} mL)
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Diaper Change Button */}
          <TouchableOpacity
            className="flex-row space-x-7"
            style={[styles.dataButton, { backgroundColor: "#23de62" }]}
            onPress={() => setDiaperModalVisible(true)}
          >
            <Image
              source={require("../assets/diaperIcon.png")}
              style={[styles.dataIcon, { marginTop: 2, tintColor: "#19b64f" }]}
            />

            <View className="flex-1">
              <Text style={styles.dataText}>Diaper</Text>
              {diaperChanges.length > 0 && (
                <Text style={styles.recordPreview}>
                  {getTimeAgo(
                    diaperChanges[diaperChanges.length - 1].date,
                    diaperChanges[diaperChanges.length - 1].time
                  )}{" "}
                  • {diaperChanges[diaperChanges.length - 1].type}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Sleep Button */}
          <TouchableOpacity
            className="flex-row space-x-7"
            style={[styles.dataButton, { backgroundColor: "#a184ff" }]}
            onPress={() => setSleepModalVisible(true)}
          >
            <Image
              source={require("../assets/sleepIcon.png")}
              style={[styles.dataIcon, { tintColor: "#8064de" }]}
            />

            <View className="flex-1">
              <Text style={styles.dataText}>Sleep</Text>
              {sleepRecords.length > 0 && (
                <Text style={styles.recordPreview}>
                  {getTimeAgo(
                    new Date(
                      sleepRecords[sleepRecords.length - 1].sleepEnd
                    ).toLocaleDateString("en-US"),
                    new Date(
                      sleepRecords[sleepRecords.length - 1].sleepEnd
                    ).toLocaleTimeString("en-US")
                  )}{" "}
                  •{" "}
                  {getSleepDuration(
                    sleepRecords[sleepRecords.length - 1].sleepStart,
                    sleepRecords[sleepRecords.length - 1].sleepEnd
                  )}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Color Selection Modal */}
          <Modal
            visible={colorModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setColorModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
              <Text style={[styles.modalTitle, { marginBottom: 20 }]}>Select Avatar Color</Text>
                <View style={styles.colorContainer}>
                  {colorOptions.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.colorOption, { backgroundColor: color }]}
                      onPress={() => {
                        updateAvatarColor(color);
                        setColorModalVisible(false);
                      }}
                    />
                  ))}
                </View>
                <View style={{ height: 20 }} />
                <View style={{ alignItems: 'center' }}>
                  <Button title="Close" onPress={() => setColorModalVisible(false)} />
                </View>
              </View>
            </View>
          </Modal>

          {/* Feeding Modal */}
          <Modal
            visible={feedingModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setFeedingModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={[styles.modalTitle, { marginBottom: 30 }]}>Add Feeding</Text>
                {Platform.OS === 'ios' && ( // iOS datetime view
                  <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={styles.modalSubtitle}>Date/Time</Text>

                    <View style={{ height: 12 }} />

                    <DateTimePicker // iOS datetime picker
                      value={selectedDate}
                      mode="datetime"
                      onChange={(event, date) => {
                        if (date) {
                          setSelectedDate(date);
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  </View>
                )}
                {Platform.OS === 'android' && ( // android datetime view
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Text style={styles.modalSubtitle}>Date: </Text>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={() => setDatePickerVisibility(true)}>
                        <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Text style={styles.modalSubtitle}>Time: </Text>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={() => setTimePickerVisibility(true)}>
                        <Text style={styles.dateText}>{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {Platform.OS === 'android' && isDatePickerVisible && ( // android date picker
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="calendar"
                    onChange={onChangeDate}
                    maximumDate={new Date()}
                  />
                )}
                {Platform.OS === 'android' && isTimePickerVisible && ( // android time picker
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="spinner"
                    onChange={onChangeTime}
                  />
                )}

                <View style={{ height: 15 }} />
                
                <TextInput
                  style={styles.input}
                  placeholder="Food Choice Name"
                  value={foodChoice}
                  onChangeText={setFoodChoice}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Amount in mL"
                  value={feedingAmount}
                  onChangeText={setFeedingAmount}
                  keyboardType="numeric"
                />
                {/* Save and Cancel Buttons */}
                <View style={{ alignItems: 'center' }}>
                  <Button title="Save" onPress={handleSaveFeeding} />
                  <View style={{ height: Platform.OS === 'android' ? 10 : 0 }} />
                  <Button title="Cancel" onPress={() => setFeedingModalVisible(false)} color="red" />
                </View>
              </View>
            </View>
          </Modal>

          {/* Diaper Change Modal */}
          <Modal
            visible={diaperModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setDiaperModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Add Diaper</Text>
                {Platform.OS === 'android' && (
                  <Text style={[styles.modalSubtitle, { marginTop: 20 }]}>Type: </Text>

                )}
                <Picker
                  selectedValue={diaperType}
                  onValueChange={(itemValue) => setDiaperType(itemValue)}
                >
                  <Picker.Item label="Wet" value="Wet" />
                  <Picker.Item label="Dirty" value="Dirty" />
                  <Picker.Item label="Mixed" value="Mixed" />
                  <Picker.Item label="Dry" value="Dry" />
                </Picker>

                {Platform.OS === 'ios' && ( // iOS datetime view
                  <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={styles.modalSubtitle}>Date & Time</Text>

                    <View style={{ height: 12 }} />
                    
                    <DateTimePicker // iOS datetime picker
                      value={selectedDate}
                      mode="datetime"
                      onChange={(event, date) => {
                        if (date) {
                          setSelectedDate(date);
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  </View>
                )}
                {Platform.OS === 'android' && ( // android datetime view
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Text style={styles.modalSubtitle}>Date: </Text>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={() => setDatePickerVisibility(true)}>
                        <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Text style={styles.modalSubtitle}>Time: </Text>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={() => setTimePickerVisibility(true)}>
                        <Text style={styles.dateText}>{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {Platform.OS === 'android' && isDatePickerVisible && ( // android date picker
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="calendar"
                    onChange={onChangeDate}
                    maximumDate={new Date()}
                  />
                )}
                {Platform.OS === 'android' && isTimePickerVisible && ( // android time picker
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="spinner"
                    onChange={onChangeTime}
                  />
                )}

                <View style={{ height: 15 }} />
                
                {/* Save and Cancel Buttons */}
                <View style={{ alignItems: 'center' }}>
                  <Button title="Save" onPress={handleSaveDiaperChange} />
                  <View style={{ height: Platform.OS === 'android' ? 10 : 0 }} />
                  <Button title="Cancel" onPress={() => setDiaperModalVisible(false)} color="red" />
                </View>
              </View>
            </View>
          </Modal>

          {/* Sleep Modal */}
          <Modal
            visible={sleepModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSleepModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={[styles.modalTitle, { marginBottom: 30 }]}>Add Sleep</Text>

                {Platform.OS === 'ios' && ( // iOS datetime view
                  <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={[styles.modalSubtitle, { marginBottom: 6 }]}>Date</Text>
                    <DateTimePicker // iOS date picker
                      value={selectedDate}
                      mode="date"
                      onChange={(event, date) => {
                        if (date) {
                          setSelectedDate(date);
                        }
                      }}
                      maximumDate={new Date()}
                    />

                    <Text style={[styles.modalSubtitle, { marginTop: 12, marginBottom: 6 }]}>Start Time</Text>
                    <DateTimePicker // iOS start time picker
                      value={sleepStart}
                      mode="time"
                      display="clock"
                      onChange={(event, time) => {
                        if (time) {
                          setSleepStart(time);
                        }
                      }}
                    />
                    
                    <Text style={[styles.modalSubtitle, { marginTop: 12, marginBottom: 6 }]}>End Time</Text>
                    <DateTimePicker // iOS end time picker
                      value={sleepEnd}
                      mode="time"
                      display="clock"
                      onChange={(event, time) => {
                        if (time) {
                          setSleepEnd(time);
                        }
                      }}
                    />
                  </View>
                )}
                {Platform.OS === 'android' && ( // android datetime view
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Text style={styles.modalSubtitle}>Date: </Text>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={() => setDatePickerVisibility(true)}>
                        <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Text style={styles.modalSubtitle}>Start Time: </Text>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={() => setStartTimePickerVisibility(true)}>
                        <Text style={styles.dateText}>{sleepStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Text style={styles.modalSubtitle}>End Time: </Text>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={() => setEndTimePickerVisibility(true)}>
                        <Text style={styles.dateText}>{sleepEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {Platform.OS === 'android' && isDatePickerVisible && ( // android date picker
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="calendar"
                    onChange={onChangeDate}
                    maximumDate={new Date()}
                  />
                )}
                {Platform.OS === 'android' && isStartTimePickerVisible && ( // android start time picker
                  <DateTimePicker
                    value={sleepStart}
                    mode="time"
                    display="spinner"
                    onChange={onChangeSleepStartTime}
                  />
                )}
                {Platform.OS === 'android' && isEndTimePickerVisible && ( // android end time picker
                  <DateTimePicker
                    value={sleepEnd}
                    mode="time"
                    display="spinner"
                    onChange={onChangeSleepEndTime}
                  />
                )}

                <View style={{ height: 15 }} />
                
                {/* Save and Cancel Buttons */}
                <View style={{ alignItems: 'center' }}>
                  <Button title="Save" onPress={handleSaveSleep} />
                  <View style={{ height: Platform.OS === 'android' ? 10 : 0 }} />
                  <Button title="Cancel" onPress={() => setSleepModalVisible(false)} color="red" />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() =>
            navigation.navigate("WeeklyReport", { fullName, babyID })
          }
        >
          <Ionicons name="calendar" size={30} color="#28436d" />
          <Text style={styles.bottomButtonText}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() =>
            navigation.navigate("BabyMilestones", { fullName, babyID })
          }
        >
          <Ionicons name="trophy" size={30} color="#28436d" />
          <Text style={styles.bottomButtonText}>Milestones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.navigate("Comments", { fullName, babyID })}
        >
          <Ionicons name="chatbubbles" size={30} color="#28436d" />
          <Text style={styles.bottomButtonText}>Comments</Text>
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.clearModalContainer}>
              <Text style={styles.modalTitle}>Clear Notifications</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to clear all notifications?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={removeNotificationsFunc}
                >
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <TouchableOpacity
          style={styles.bottomButton}
          onLongPress={() => setModalVisible(true)}
          onPress={() =>
            navigation.navigate("Notification", {
              fullName,
              babyID,
              notifications,
            })
          }
        >
          <Ionicons name="notifications" size={30} color="#28436d" />
          <Text style={styles.bottomButtonText}>Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
    flex: 1,
    fontSize: 30,
    textAlign: "center",
    fontWeight: "bold",
    color: "#28436d",
  },
  dataButton: {
    borderRadius: 8,
    alignItems: "center",
    height: 100,
  },
  dataText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  dataIcon: {
    width: 70,
    height: 70,
    marginLeft: 12,
  },
  profileSection: {
    flexDirection: "row",
    width: "100%",
    marginHorizontal: 10,
  },
  avatarBubble: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    textAlign: "center",
  },
  nameText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  todoList: {
    marginLeft: 60,
    marginRight: 15,
    fontWeight: "bold",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#999",
    flex: 1,
  },
  todoButtonText: {
    color: "#28436d",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  todoInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  recordPreview: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    width: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 15,
    color: '#007BFF',
  },
  input: {
    width: 250,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  todoItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  todoItem: {
    fontSize: 16,
    flex: 1,
  },
  deleteIcon: {
    marginLeft: 10,
  },
  avatarSelection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#cfe2f3',
    paddingHorizontal: 16
  },
  bottomButton: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    paddingVertical: 20,
  },
  bottomButtonText: {
    color: "#28436d",
    marginTop: 4,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  clearModalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    flex: 1,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
})

