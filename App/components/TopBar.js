import React from "react";
import { View, Text } from "react-native";
import styles from "../styles";

export default function TopBar({ title }) {
  return (
    <View style={styles.topBar}>
      <Text style={styles.topBarText}>{title}</Text>
    </View>
  );
}
