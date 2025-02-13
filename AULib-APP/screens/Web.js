import React, { useRef, useState } from "react";
import { SafeAreaView, StatusBar, View, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import TopBar from "../components/TopBar";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles";
import colors from "../constants/colors";

export default function Web() {
  const webViewRef = useRef(null); // Ref for WebView
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // Handle WebView navigation
  const handleBackPress = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const handleForwardPress = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  // Handle WebView refresh
  const handleRefreshPress = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <TopBar title="Web" />
      <WebView
        ref={webViewRef}
        source={{ uri: "https://idp.annauniv.edu/" }}
        style={styles.webView}
        onLoadProgress={({ nativeEvent }) => {
          setCanGoBack(nativeEvent.canGoBack);
          setCanGoForward(nativeEvent.canGoForward);
        }}
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={(request) => {
          if (!request.url.startsWith("http")) return false;
          return true;
        }}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Back Button */}
        <TouchableOpacity onPress={handleBackPress} style={styles.navItem}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity onPress={handleRefreshPress} style={styles.navItem}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>

        {/* Forward Button */}
        <TouchableOpacity onPress={handleForwardPress} style={styles.navItem}>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
