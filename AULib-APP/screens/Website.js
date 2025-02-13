import React from "react";
import { Button } from "react-native";
import * as WebBrowser from "expo-web-browser";

export default function Website() {
  const openWebsite = async () => {
    await WebBrowser.openBrowserAsync("https://www.google.com/");
  };

  return <Button title="Open WebView" onPress={openWebsite} />;
}
