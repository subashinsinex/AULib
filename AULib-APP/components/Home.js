import React, { useState, useEffect, useContext } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import Chart from "../components/Chart";
import FillerComponent from "../components/FillerComponent";
import styles from "../styles";
import colors from "../constants/colors";
import * as SecureStore from "expo-secure-store";
import secret from "../constants/secret";
import { AuthContext } from "../constants/AuthContext";

export default function Home() {
  const [showFiller, setShowFiller] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginStats, setLoginStats] = useState({
    total_logins: 0,
    monthly_logins: 0,
    yearly_logins: 0,
  });
  const { accessToken } = useContext(AuthContext);

  useEffect(() => {
    const loadProfileAndStats = async () => {
      try {
        const storedProfile = await SecureStore.getItemAsync("profile");

        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile(parsedProfile);
          await fetchLoginStats(parsedProfile.user_id);
        } else {
          console.log("No profile data found.");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndStats();
  }, []);

  const fetchLoginStats = async (userId) => {
    try {
      const response = await fetch(
        `http://${secret.Server_IP}:${secret.Server_Port}/stats/login/${userId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();

      if (response.ok) {
        setLoginStats(data);
      } else {
        console.error("Error fetching login stats:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch login statistics:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Greeting Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>
            Welcome, {profile ? profile.name : "Guest"}!
          </Text>
        </View>

        {/* Login Stats Section */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Logins</Text>
            <Text style={styles.cardValue}>{loginStats.total_logins}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resources Accessed</Text>
            <Text style={styles.cardValue}>-</Text>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartContainer}>
          <Chart
            title="Your Monthly Usage"
            data={{
              labels: ["Login", "Resource", "PDF"],
              datasets: [{ data: [loginStats.monthly_logins, 0, 0] }],
            }}
          />
          <Chart
            title="Your Overall Usage"
            data={{
              labels: ["Login", "Resource", "PDF"],
              datasets: [{ data: [loginStats.yearly_logins, 0, 0] }],
            }}
          />
        </View>
      </ScrollView>

      {/* Conditionally Render FillerComponent */}
      {showFiller && (
        <View style={styles.fillerOverlay}>
          <FillerComponent />
        </View>
      )}
    </SafeAreaView>
  );
}
