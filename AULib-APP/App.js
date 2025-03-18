import React, { useState, useEffect, useRef, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  BackHandler,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Dashboard from "./screens/Dashboard";
import Search from "./screens/Search";
import Web from "./screens/Web";
import LoginScreen from "./screens/Login";
import Profile from "./screens/Profile";
import BottomNav from "./components/BottomNav";
import { AuthProvider, AuthContext } from "./constants/AuthContext";
import ActiveTimer from "./constants/ActiveTimer";
import Splash from "./screens/Splash";

const Stack = createStackNavigator();

function ScreenWrapper({ children, hideBottomNav }) {
  return (
    <View style={{ flex: 1 }}>
      {children}
      {!hideBottomNav && <BottomNav />}
    </View>
  );
}

function AppContent() {
  const { refreshAccessToken, accessToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const exitCount = useRef(0);
  const navigationRef = useRef(null);

  // Ensure ActiveTimer refreshes the token before app starts
  useEffect(() => {
    const initializeApp = async () => {
      await refreshAccessToken();
      setLoading(false);
    };

    initializeApp();
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (!navigationRef.current) return false;

      const currentScreen = navigationRef.current.getCurrentRoute()?.name;

      if (currentScreen === "Dashboard" || currentScreen === "Login") {
        if (exitCount.current === 1) {
          BackHandler.exitApp();
          return true;
        }
        exitCount.current = 1;
        ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);

        setTimeout(() => {
          exitCount.current = 0;
        }, 2000);
        return true;
      }

      if (navigationRef.current.canGoBack()) {
        navigationRef.current.goBack();
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <ActiveTimer />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animationEnabled: false,
              cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
            }}
          >
            <Stack.Screen name="Splash" component={Splash} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Dashboard">
              {() => (
                <ScreenWrapper hideBottomNav={false}>
                  <Dashboard />
                </ScreenWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Search">
              {() => (
                <ScreenWrapper hideBottomNav={false}>
                  <Search />
                </ScreenWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Web">
              {({ route }) => (
                <ScreenWrapper hideBottomNav={true}>
                  <Web route={route} />
                </ScreenWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Profile">
              {() => (
                <ScreenWrapper hideBottomNav={false}>
                  <Profile />
                </ScreenWrapper>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </NavigationContainer>
  );
}

export default function App() {
  const navigationRef = useRef(null);
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return (
    <AuthProvider navigationRef={navigationRef}>
      <AppContent />
    </AuthProvider>
  );
}
