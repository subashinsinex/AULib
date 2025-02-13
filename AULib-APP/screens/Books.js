import React, { useState, useMemo } from "react";
import {
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  View,
} from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import colors from "../constants/colors";
import styles from "../styles";
import TopBar from "../components/TopBar";
import BasicSearch from "../components/BasicSearch";
import AdvancedSearch from "../components/AdvancedSearch";

export default function Books() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "basic", title: "Basic Search" },
    { key: "advanced", title: "Advanced Search" },
  ]);

  // Persist the search components
  const basicSearchComponent = useMemo(() => <BasicSearch />, []);
  const advancedSearchComponent = useMemo(() => <AdvancedSearch />, []);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "basic":
        return <View style={{ flex: 1 }}>{basicSearchComponent}</View>;
      case "advanced":
        return <View style={{ flex: 1 }}>{advancedSearchComponent}</View>;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <TopBar title="eResources" />

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
  );
}
