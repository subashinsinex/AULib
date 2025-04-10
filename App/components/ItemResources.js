import React, { useContext, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import secret from "../constants/secret";
import axios from "axios";
import { AuthContext } from "../constants/AuthContext";

const ItemResources = React.memo(({ item }) => {
  const navigation = useNavigation();
  const { accessToken, user } = useContext(AuthContext);
  const resourceLink = item.file_url || null;

  // Memoized function to log resource access
  const logResourceAccess = useCallback(async () => {
    if (!item.res_id || !user) return;

    try {
      await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/eresources/log-access`,
        { res_id: item.res_id, user_id: user },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 5000, // Add timeout to prevent hanging
        }
      );
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Error logging access:", error);
      }
    }
  }, [item.res_id, user, accessToken]);

  const handlePress = useCallback(async () => {
    if (!resourceLink) return;

    try {
      // Check if URL is valid
      const supported = await Linking.canOpenURL(resourceLink);
      if (supported) {
        await logResourceAccess();
        navigation.push("Web", {
          uri: resourceLink,
          title: item.title || "Resource",
        });
      } else {
        console.warn("Cannot open URL:", resourceLink);
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  }, [resourceLink, logResourceAccess, navigation, item.title]);

  // Determine resource type color
  const getResourceTypeColor = () => {
    switch (item.type_name) {
      case "eBook":
        return "#4CAF50";
      case "eJournal":
        return "#2196F3";
      case "Conference Paper":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!resourceLink}
    >
      <View style={styles.content}>
        {/* Title with icon */}
        <View style={styles.titleContainer}>
          <MaterialIcons
            name={resourceLink ? "link" : "block"}
            size={20}
            color={resourceLink ? "#1976D2" : "#9E9E9E"}
            style={styles.icon}
          />
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {item.title || "No Title Available"}
          </Text>
        </View>

        {/* Publisher and resource type */}
        <View style={styles.detailsContainer}>
          <Text style={styles.publisher} numberOfLines={1} ellipsizeMode="tail">
            {item.publish_name || "Publisher Unknown"}
          </Text>

          {item.type_name && (
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: getResourceTypeColor() },
              ]}
            >
              <Text style={styles.typeText}>{item.type_name}</Text>
            </View>
          )}
        </View>

        {/* Additional metadata (if available) */}
        {(item.isbn || item.issn) && (
          <Text style={styles.identifier}>
            {item.isbn ? `ISBN: ${item.isbn}` : `ISSN: ${item.issn}`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    lineHeight: 22,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  publisher: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  typeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  identifier: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
});

export default ItemResources;
