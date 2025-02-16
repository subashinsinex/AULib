import React, { useRef, useState } from "react";
import { SafeAreaView, StatusBar, View, TouchableOpacity } from "react-native";
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
        <TouchableOpacity onPress={handleBackPress} style={styles.navItem}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRefreshPress} style={styles.navItem}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForwardPress} style={styles.navItem}>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>

        {/* Close Button to Go Back */}
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
