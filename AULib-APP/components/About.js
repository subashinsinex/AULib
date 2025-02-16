import React from "react";
import { Text, View } from "react-native";
import styles from "../styles";
import FillerComponent from "./FillerComponent";

export default function About() {
  return (
    <>
      <View>
        <Text style={styles.greeting}>About</Text>
      </View>
      <FillerComponent />
    </>
  );
}
