import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  Dimensions,
} from "react-native";
import axios from "axios";
import secret from "../constants/secret";
import ItemCard from "./ItemCard";
import FillerComponent from "./FillerComponent";
import { AuthContext } from "../constants/AuthContext";

const Favorites = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );
  const [contentHeight, setContentHeight] = useState(0);
  const { user, accessToken } = useContext(AuthContext);
  const userId = Number(user);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(
        `http://${secret.Server_IP}:${secret.Server_Port}/favorites/${userId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.data || !Array.isArray(response.data.favorites)) {
        throw new Error("Invalid response format from server");
      }

      const favoriteDOIs = response.data.favorites;
      if (favoriteDOIs.length > 0) {
        await fetchMetadata(favoriteDOIs);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error(
        "Error fetching favorites:",
        error?.response?.data || error.message
      );
      setLoading(false);
    }
  };

  const fetchMetadata = async (DOIs) => {
    try {
      const metadataList = await Promise.all(
        DOIs.map(async (doi) => {
          try {
            const response = await axios.get(
              `http://${secret.Server_IP}:${secret.Server_Port}/search/fetch-advanced`,
              {
                params: { doi, userId },
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            return response.data.length > 0
              ? { ...response.data[0], isFav: true }
              : null;
          } catch (error) {
            // console.error(
            //   `Error fetching metadata for DOI: ${doi}`,
            //   error.response?.data || error.message
            // );
            return null;
          }
        })
      );

      setData(metadataList.filter(Boolean));
    } catch (error) {
      console.error("Error processing metadata:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = useCallback(
    async (doi) => {
      try {
        await axios.post(
          `http://${secret.Server_IP}:${secret.Server_Port}/favorites`,
          {
            userId,
            doi,
            isFav: false,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setData((prevData) =>
          prevData.filter((item) => item["prism:doi"] !== doi)
        );
      } catch (error) {
        console.error("Error removing favorite:", error);
      }
    },
    [accessToken]
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(event) => setScreenHeight(event.nativeEvent.layout.height)}
    >
      {data.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No favorites found.
        </Text>
      ) : (
        <>
          <FlatList
            data={data}
            keyExtractor={(item) => item["prism:doi"]}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                isFav={true}
                toggleFavorite={() => removeFavorite(item["prism:doi"])}
              />
            )}
            contentContainerStyle={{ flexGrow: 1 }}
            onContentSizeChange={(width, height) => setContentHeight(height)}
          />
          {/* Render FillerComponent if there's extra space */}
          {screenHeight > contentHeight && (
            <View style={{ height: screenHeight - contentHeight }}>
              <FillerComponent />
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default Favorites;
