import React, { useState } from "react";
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import Dashboard from "./screens/Dashboard";
import Books from "./screens/Books";
import BottomNav from "./components/BottomNav";
import styles from "./styles";
import Web from "./screens/Web";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("Dashboard");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {currentScreen === "Dashboard" && <Dashboard />}
          {currentScreen === "Web" && <Web />}
          {currentScreen === "Books" && <Books />}

          <BottomNav
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
