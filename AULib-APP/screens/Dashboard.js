import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  View,
} from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // ✅ Only this is needed
import colors from "../constants/colors";
import styles from "../styles";
import TopBar from "../components/TopBar";
import Home from "../components/Home";
import Favorites from "../components/Favorites";
import About from "../components/About";

export default function Dashboard() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "home", title: "Home" },
    { key: "favorites", title: "Favorites" },
    { key: "about", title: "About" },
  ]);

  const homeComponent = useMemo(() => <Home />, []);
  const favComponent = useMemo(() => <Favorites />, []);
  const aboutComponent = useMemo(() => <About />, []);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "home":
        return <View style={{ flex: 1 }}>{homeComponent}</View>;
      case "favorites":
        return <View style={{ flex: 1 }}>{favComponent}</View>;
      case "about":
        return <View style={{ flex: 1 }}>{aboutComponent}</View>;
      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ✅ Global gesture handling without interference */}
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        <TopBar title="Dashboard" />

        <View style={{ flex: 1 }}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={(props) => (
              <TabBar
                {...props}
                style={{ backgroundColor: colors.primary }}
                indicatorStyle={{ backgroundColor: colors.white }}
              />
            )}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
