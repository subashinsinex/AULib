import React, { useEffect, useState, useContext } from "react";
import { View, Text, Image, Animated, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import colors from "../constants/colors";
import { AuthContext } from "../constants/AuthContext";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

const SplashScreenComponent = ({ navigation }) => {
  const { refreshAccessToken } = useContext(AuthContext);
  const [progress, setProgress] = useState(0);
  const [navigateTo, setNavigateTo] = useState("Login");
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    async function checkAuth() {
      await SplashScreen.hideAsync();

      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      if (accessToken && refreshToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          setNavigateTo("Dashboard");
        }
      }
    }

    checkAuth();

    let progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      navigation.replace(navigateTo);
    }
  }, [progress, navigateTo, navigation]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 40,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.SplashContainer}>
      <Image
        source={require("../assets/Anna_University.png")}
        style={styles.SplashLogo}
      />
      <View style={styles.SplashProgressContainer}>
        <View style={styles.SplashProgressBar}>
          <Animated.View
            style={[
              styles.SplashProgressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.SplashProgressText}>Loading... {progress}%</Text>
      </View>
    </View>
  );
};

export default SplashScreenComponent;

const styles = StyleSheet.create({
  SplashContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
  },
  SplashLogo: {
    width: width * 0.6,
    height: height * 0.3,
    resizeMode: "contain",
  },
  SplashProgressContainer: {
    position: "absolute",
    bottom: height * 0.05,
    width: "80%",
    alignItems: "center",
  },
  SplashProgressBar: {
    width: "100%",
    height: height * 0.01,
    backgroundColor: "#ccc",
    borderRadius: height * 0.005,
    overflow: "hidden",
  },
  SplashProgressFill: {
    height: "100%",
    backgroundColor: colors.white,
  },
  SplashProgressText: {
    color: "#ffffff",
    fontSize: height * 0.02,
    marginTop: height * 0.015,
  },
});
