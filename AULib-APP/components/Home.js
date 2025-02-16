import React from "react";
import { SafeAreaView, ScrollView, View, Text } from "react-native";
import Chart from "../components/Chart";
import FillerComponent from "../components/FillerComponent"; // Import your FillerComponent
import styles from "../styles";

export default function Home() {
  const [showFiller, setShowFiller] = React.useState(true); // Control visibility of the filler component

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.greeting}>Welcome User!</Text>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Logins</Text>
            <Text style={styles.cardValue}>286</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resources Accessed</Text>
            <Text style={styles.cardValue}>570</Text>
          </View>
        </View>
        <Chart
          title="Your Monthly Usage"
          data={{
            labels: ["Login", "Resource", "PDF"],
            datasets: [{ data: [7, 23, 6] }],
          }}
        />
        <Chart
          title="Your Overall Usage"
          data={{
            labels: ["Login", "Resource", "PDF"],
            datasets: [{ data: [7, 23, 6] }],
          }}
        />
      </ScrollView>

      {/* Conditionally render the FillerComponent as an overlay */}
      {showFiller && (
        <View style={styles.fillerOverlay}>
          <FillerComponent />
        </View>
      )}
    </SafeAreaView>
  );
}
