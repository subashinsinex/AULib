import React from "react";
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
} from "react-native";
import Dashboard from "./screens/Dashboard";
import Books from "./screens/Books";
import Web from "./screens/Web";
import BottomNav from "./components/BottomNav";

const Stack = createStackNavigator();

function ScreenWrapper({ children, hideBottomNav }) {
  if (!children) return null; // Prevents rendering undefined content

  return (
    <View style={{ flex: 1 }}>
      {React.isValidElement(children) ? children : <View />}
      {!hideBottomNav && <BottomNav />}
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
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
            <Stack.Screen name="Dashboard">
              {() => (
                <ScreenWrapper hideBottomNav={false}>
                  <Dashboard />
                </ScreenWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Books">
              {() => (
                <ScreenWrapper hideBottomNav={false}>
                  <Books />
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
          </Stack.Navigator>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </NavigationContainer>
  );
}
