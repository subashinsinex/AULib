import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { IconButton } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../constants/colors";
import secret from "../constants/secret";
import { AuthContext } from "../constants/AuthContext";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles";

const Login = () => {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (accessToken && refreshToken) {
        navigation.replace("Dashboard");
      }
    };

    checkIfLoggedIn();
  }, [navigation]);

  const handleLogin = async () => {
    if (!user_id || !password) {
      setError("Please enter your AU ID and password");
      return;
    }

    try {
      const response = await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/userAuth/login`,
        { user_id, password }
      );

      const { accessToken, refreshToken } = response.data;

      // ✅ Store userId along with tokens using Expo SecureStore
      await SecureStore.setItemAsync("accessToken", accessToken);
      await SecureStore.setItemAsync("refreshToken", refreshToken);

      // Store userId (optional, based on your need)
      await login(accessToken, refreshToken, user_id);

      Alert.alert("Success", "Login Successful!");
      navigation.replace("Dashboard");
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || "Invalid credentials");
      } else {
        setError("Network error. Try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.LoginContainer}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      {/* Logo at the top */}
      <Image
        source={require("../assets/Anna_University.png")}
        style={styles.LoginLogo}
      />

      <Text style={styles.LoginTitle}>Login</Text>
      <Text style={styles.LoginSubtitle}>Please enter your credentials</Text>

      {/* AU ID Input */}
      <View style={styles.LoginInputContainer}>
        <MaterialIcons name="person" size={24} color={colors.primary} />
        <TextInput
          style={styles.LoginInput}
          placeholder="Anna University ID"
          value={user_id}
          onChangeText={setUserId}
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.LoginInputContainer}>
        <MaterialIcons name="lock" size={24} color={colors.primary} />
        <TextInput
          style={styles.LoginInput}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <IconButton
          icon={showPassword ? "eye-off" : "eye"}
          size={24}
          color={colors.primary}
          onPress={() => setShowPassword(!showPassword)}
        />
      </View>

      {error ? <Text style={styles.LoginError}>{error}</Text> : null}

      {/* Login Button */}
      <TouchableOpacity style={styles.LoginButton} onPress={handleLogin}>
        <Text style={styles.LoginButtonText}>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Login;
