import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Keyboard,
  ToastAndroid,
  Platform,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import styles from "../styles";
import icons from "../constants/icons";
import axios from "axios";
import secret from "../constants/secret";
import ItemCard from "../components/ItemCard";
import FillerComponent from "../components/FillerComponent";

const AdvancedSearch = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [doi, setDoi] = useState("");
  const [issn, setIssn] = useState("");
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );
  const [contentHeight, setContentHeight] = useState(0);

  const itemsPerPage = 20;
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const userId = 1;

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await axios.get(
          `http://${secret.Server_IP}:${secret.Server_Port}/favorites/${userId}`
        );
        setFavorites(new Set(res.data.favorites));
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    };
    loadFavorites();
  }, []);

  const fetchData = async (page = 0, isLoadMore = false) => {
    if (!title && !author && !doi && !issn && !keyword) {
      setMessage("Please enter at least one search parameter.");
      return;
    }

    if (isLoadMore) setLoadingMore(true);
    else {
      setLoading(true);
      setData([]);
    }

    try {
      const response = await axios.get(
        `http://${secret.Server_IP}:${secret.Server_Port}/fetch-advanced`,
        {
          params: {
            title,
            author,
            doi,
            issn,
            keyword,
            startIndex: page * itemsPerPage,
            itemsPerPage,
            userId,
          },
        }
      );

      const results = response.data || [];
      if (!Array.isArray(results)) throw new Error("Unexpected data format");

      const updatedResults = results.map((item) => ({
        ...item,
        isFav: favorites.has(item["prism:doi"]),
      }));

      setData((prevData) =>
        isLoadMore ? [...prevData, ...updatedResults] : updatedResults
      );
      setMessage(results.length === 0 ? "No resources found" : "");
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Error fetching data. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    fetchData(0);
  };

  const toggleFavorite = useCallback(async (doi, isFav) => {
    try {
      await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/favorites`,
        { userId, doi, isFav: !isFav }
      );

      setFavorites((prevFavs) => {
        const newFavs = new Set(prevFavs);
        isFav ? newFavs.delete(doi) : newFavs.add(doi);
        return newFavs;
      });

      setData((prevData) =>
        prevData.map((item) =>
          item["prism:doi"] === doi ? { ...item, isFav: !isFav } : item
        )
      );

      const message = isFav ? "Removed from favorites!" : "Added to favorites!";
      Platform.OS === "android"
        ? ToastAndroid.show(message, ToastAndroid.SHORT)
        : Alert.alert(message);
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  }, []);

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View
        style={{ flex: 1 }}
        onLayout={(event) => setScreenHeight(event.nativeEvent.layout.height)}
      >
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              userId={userId}
              isFav={item.isFav}
              toggleFavorite={() =>
                toggleFavorite(item["prism:doi"], item.isFav)
              }
            />
          )}
          keyExtractor={(item, index) =>
            `${item["prism:doi"] || "no-doi"}-${index}`
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          onEndReached={() => fetchData(currentPage + 1, true)}
          onEndReachedThreshold={0.2}
          onContentSizeChange={(width, height) => setContentHeight(height)}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#007bff" />
            ) : null
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          ListHeaderComponent={
            <View style={styles.advancedSearchContainer}>
              <View style={styles.row}>
                <TextInput
                  style={styles.advancedSearchInput}
                  placeholder="Title"
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={styles.advancedSearchInput}
                  placeholder="Author"
                  value={author}
                  onChangeText={setAuthor}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={styles.advancedSearchInput}
                  placeholder="DOI"
                  value={doi}
                  onChangeText={setDoi}
                />
                <TextInput
                  style={styles.advancedSearchInput}
                  placeholder="ISSN"
                  value={issn}
                  onChangeText={setIssn}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={styles.advancedSearchInput}
                  placeholder="Keyword"
                  value={keyword}
                  onChangeText={setKeyword}
                />
                <TouchableOpacity
                  style={styles.advancedSearchButton}
                  onPress={handleSearch}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    icons.search
                  )}
                </TouchableOpacity>
              </View>
            </View>
          }
        />

        {data.length === 0 && (
          <View style={{ height: screenHeight - contentHeight }}>
            <FillerComponent />
          </View>
        )}

        <Animated.View
          style={[
            styles.floatingButtonContainer,
            {
              opacity: scrollY.interpolate({
                inputRange: [75, 75],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
            },
          ]}
        >
          <TouchableOpacity style={styles.floatingButton} onPress={scrollToTop}>
            {icons.arrowup}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AdvancedSearch;
