import React from "react";
import { SafeAreaView, StatusBar, ScrollView, View, Text } from "react-native";
import TopBar from "../components/TopBar";
import Chart from "../components/Chart";
import colors from "../constants/colors";
import styles from "../styles";

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <TopBar title="Home" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.greeting}>Anna University Library</Text>
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
    </SafeAreaView>
  );
}
