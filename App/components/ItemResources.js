import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles";
import secret from "../constants/secret";
import axios from "axios";
import { AuthContext } from "../constants/AuthContext";

const ItemResources = React.memo(({ item }) => {
  const navigation = useNavigation();
  const resourceLink = item.file_url || "#";
  const { accessToken, user } = useContext(AuthContext);

  const logResourceAccess = async () => {
    try {
      await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/eresources/log-access`,
        { res_id: item.res_id, user_id: user },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error("Error logging access:", error);
    }
  };

  const handlePress = () => {
    if (resourceLink !== "#") {
      logResourceAccess();
      navigation.push("Web", { uri: resourceLink });
    }
  };

  return (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title || "No Title"}
        </Text>

        <View
          style={[
            styles.row,
            {
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 0,
            },
          ]}
        >
          <Text style={styles.itemDetails} numberOfLines={1}>
            {item.publish_name || "Unknown Publisher"}
          </Text>

          {item.type_name && (
            <View style={styles.openAccessBadge}>
              <Text style={styles.openAccessText}>{item.type_name}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default ItemResources;
