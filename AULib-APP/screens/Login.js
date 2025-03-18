import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
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

      await SecureStore.setItemAsync("accessToken", accessToken);
      await SecureStore.setItemAsync("refreshToken", refreshToken);

      const profileResponse = await axios.get(
        `http://${secret.Server_IP}:${secret.Server_Port}/profile/${user_id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const profileData = profileResponse.data;
      const profileDataString = JSON.stringify(profileData);
      await SecureStore.setItemAsync("profile", profileDataString);

      await login(accessToken, refreshToken, user_id, profileData);

      Alert.alert("Success", "Login Successful!");
      navigation.replace("Dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response) {
        setError(err.response.data.error || "Invalid credentials");
      } else if (err.request) {
        setError("Server unreachable. Check your network.");
      } else {
        setError("Unexpected error occurred.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.LoginContainer}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.LoginContent}
      >
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
            placeholderTextColor="#999"
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
            placeholderTextColor="#999"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
