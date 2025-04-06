import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SecureStore from "expo-secure-store";
import colors from "../constants/colors";
import styles from "../styles";
import TopBar from "../components/TopBar";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await SecureStore.getItemAsync("profile");
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        } else {
          setError("No profile data found.");
        }
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Profile details array
  const profileDetails = profile
    ? [
        { label: "Card Number", value: profile.user_id },
        { label: "Mobile", value: profile.mobile },
        { label: "Category", value: profile.category_name },
        { label: "College", value: profile.college_name },
        { label: "Department", value: profile.department_name },
        { label: "Branch", value: profile.branch_name },
        { label: "Degree", value: profile.degree_name },
        {
          label: "Batch",
          value: `${profile.batch_in} - ${profile.batch_out}`,
        },
        {
          label: "Login Time",
          value: profile.last_login
            ? new Date(profile.last_login).toLocaleString("en-US", {
                dateStyle: "long",
                timeStyle: "short",
              })
            : "Not Available",
        },
      ]
    : [];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        <TopBar title="Profile" />

        <View style={profileStyles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : error ? (
            <Text style={profileStyles.errorText}>{error}</Text>
          ) : profile ? (
            <View style={{ width: "100%" }}>
              <View style={profileStyles.profileHeader}>
                <Icon name="person" size={125} color={colors.primary} />
                <Text style={profileStyles.name}>{profile.name}</Text>
                <Text style={profileStyles.email}>{profile.email}</Text>
              </View>

              <View style={profileStyles.detailsContainer}>
                {profileDetails.map((item, index) => (
                  <DetailItem
                    key={index}
                    label={item.label}
                    value={capitalizeFirstLetter(item.value)}
                    isLast={index === profileDetails.length - 1} // Pass `isLast` prop
                  />
                ))}
              </View>
            </View>
          ) : (
            <Text style={profileStyles.errorText}>No profile data found.</Text>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const DetailItem = ({ label, value, isLast }) => (
  <View
    style={[
      profileStyles.detailItem,
      isLast && { borderBottomWidth: 0 }, // Remove border for the last item
    ]}
  >
    <Text style={profileStyles.label}>{label}</Text>
    <Text style={profileStyles.value}>{value}</Text>
  </View>
);

const profileStyles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 5,
  },
  detailsContainer: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  value: {
    fontSize: 16,
    color: colors.white,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
  },
});
