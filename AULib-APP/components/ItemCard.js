import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import styles from "../styles";

const ItemCard = React.memo(({ item, isFav, toggleFavorite }) => {
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
          <Text style={styles.itemAuthor} numberOfLines={1}>
            {item["dc:creator"] || "Unknown Author"}
          </Text>
          {item.openaccessFlag && (
            <View style={styles.openAccessBadge}>
              <Text style={styles.openAccessText}>Open Access</Text>
            </View>
          )}
        </View>

        <Text style={styles.itemJournal} numberOfLines={1}>
          {item["prism:publicationName"] || "Unknown Journal"}
        </Text>

        <View
          style={[
            styles.row,
            { alignItems: "center", justifyContent: "space-between" },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.itemDetails} numberOfLines={1}>
              {item["prism:volume"] ? `Vol. ${item["prism:volume"]}` : ""}
              {item["prism:issueIdentifier"]
                ? `, Issue ${item["prism:issueIdentifier"]}`
                : ""}
            </Text>
            <Text style={styles.itemDetails} numberOfLines={1}>
              {item["prism:coverDisplayDate"] || ""}
            </Text>
          </View>

          <TouchableOpacity onPress={toggleFavorite} style={styles.favButton}>
            <FontAwesome
              name={isFav ? "heart" : "heart-o"}
              size={25}
              color={isFav ? "red" : "gray"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default ItemCard; // ✅ Correct export
