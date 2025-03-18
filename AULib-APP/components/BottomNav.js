import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import icons from "../constants/icons";
import styles from "../styles";
import colors from "../constants/colors";

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();

  const handlePress = (screen) => {
    if (route.name !== screen) {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handlePress("Dashboard")}
      >
        {React.cloneElement(icons.home, {
          color: route.name === "Dashboard" ? colors.white : colors.gray,
        })}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handlePress("Search")}
      >
        {React.cloneElement(icons.search, {
          color: route.name === "Search" ? colors.white : colors.gray,
        })}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handlePress("Profile")}
      >
        {React.cloneElement(icons.person, {
          color: route.name === "Profile" ? colors.white : colors.gray,
        })}
      </TouchableOpacity>
    </View>
  );
}
