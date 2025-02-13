import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import styles from "../styles";

const ItemCard = ({ item }) => {
  const scopusLink =
    item.link?.find((link) => link["@ref"] === "scopus")?.["@href"] || "#";

  const handlePress = () => {
    if (scopusLink !== "#") {
      Linking.openURL(scopusLink);
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
          {item["dc:title"] || "No Title"}
        </Text>
        <Text style={styles.itemAuthor} numberOfLines={1}>
          {item["dc:creator"] || "Unknown Author"}
        </Text>
        <Text style={styles.itemJournal} numberOfLines={1}>
          {item["prism:publicationName"] || "Unknown Journal"}
        </Text>
        <Text style={styles.itemDetails} numberOfLines={1}>
          {item["prism:volume"] ? `Vol. ${item["prism:volume"]}` : ""}
          {item["prism:issueIdentifier"]
            ? `, Issue ${item["prism:issueIdentifier"]}`
            : ""}
        </Text>
        <Text style={styles.itemDetails} numberOfLines={1}>
          {item["prism:coverDisplayDate"] || ""}
        </Text>
        {item.openaccessFlag && (
          <View style={styles.openAccessBadge}>
            <Text style={styles.openAccessText}>Open Access</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ItemCard;
