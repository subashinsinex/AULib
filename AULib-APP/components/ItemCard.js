import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import styles from "../styles";
import colors from "../constants/colors";

const ItemCard = React.memo(({ item, isFav, toggleFavorite }) => {
  const navigation = useNavigation();
  const scopusLink = item["prism:doi"]
    ? `https://doi.org/${item["prism:doi"]}`
    : item.link?.find((link) => link["@ref"] === "scopus")?.["@href"] || "#";

  const handlePress = () => {
    if (scopusLink !== "#") {
      navigation.push("Web", { uri: scopusLink }); // ✅ Open a new instance of Web.js
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
            {
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 0,
            },
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
              color={isFav ? colors.primary : "gray"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default ItemCard;
