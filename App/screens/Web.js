import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  TouchableOpacity,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import TopBar from "../components/TopBar";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles";
import colors from "../constants/colors";

export default function Web() {
  const navigation = useNavigation();
  const route = useRoute();
  const { uri } = route.params || { uri: "https://idp.annauniv.edu/" };
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // Handle WebView Navigation Updates
  const handleNavigationStateChange = (event) => {
    setCanGoBack(event.canGoBack);
    setCanGoForward(event.canGoForward);
  };

  // Handle Back Navigation
  const handleBackPress = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  // Handle Forward Navigation
  const handleForwardPress = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  // Handle Refresh
  const handleRefreshPress = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <TopBar title="Web View" />

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={false} // Avoid Cloudflare cookie issues
        thirdPartyCookiesEnabled={false} // Avoid Cloudflare tracking blocks
        setSupportMultipleWindows={false} // Support popups
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile; rv:109.0) Gecko/109.0 Firefox/109.0"
        onNavigationStateChange={handleNavigationStateChange}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={handleBackPress} style={styles.navItem}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRefreshPress} style={styles.navItem}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForwardPress} style={styles.navItem}>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navItem}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
