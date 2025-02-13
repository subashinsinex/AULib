import React from "react";
import { TouchableOpacity, View } from "react-native";
import icons from "../constants/icons";
import styles from "../styles";

export default function BottomNav({ currentScreen, setCurrentScreen }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setCurrentScreen("Dashboard")}
      >
        {React.cloneElement(icons.home, {
          color: currentScreen === "Dashboard" ? "#FFF" : "#888",
        })}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setCurrentScreen("Books")}
      >
        {React.cloneElement(icons.book, {
          color: currentScreen === "Books" ? "#FFF" : "#888",
        })}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setCurrentScreen("Web")}
      >
        {React.cloneElement(icons.globe, {
          color: currentScreen === "Web" ? "#FFF" : "#888",
        })}
      </TouchableOpacity>
    </View>
  );
}
