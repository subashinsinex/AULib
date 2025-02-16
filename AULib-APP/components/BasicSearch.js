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
} from "react-native";
import styles from "../styles";
import icons from "../constants/icons";
import axios from "axios";
import ItemCard from "../components/ItemCard";
import FillerComponent from "../components/FillerComponent";
import secret from "../constants/secret";

const BasicSearch = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [favorites, setFavorites] = useState(new Set());

  const itemsPerPage = 25;
  const flatListRef = useRef(null);
  const userId = 1;
  const scrollY = useRef(new Animated.Value(0)).current;

  // ✅ Load favorites
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

  useEffect(() => {
    loadFavorites();
  }, []);

  // ✅ Fetch data
  const fetchData = async (page = 0, isLoadMore = false) => {
    if (!query.trim()) return;

    if (isLoadMore) setLoadingMore(true);
    else {
      setLoading(true);
      setData([]);
    }

    Keyboard.dismiss();

    try {
      const startIndex = page * itemsPerPage;
      const response = await axios.get(
        `http://${secret.Server_IP}:${secret.Server_Port}/fetch`,
        { params: { query, startIndex, itemsPerPage, userId } }
      );

      let results = response.data || [];
      if (!Array.isArray(results)) {
        setMessage("Error: Unexpected data format");
        setLoading(false);
        setLoadingMore(false);
        return;
      }

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

  // ✅ Toggle favorite
  const toggleFavorite = useCallback(async (doi, isFav) => {
    try {
      await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/favorites`,
        { userId, doi, isFav: !isFav }
      );

      setFavorites((prevFavs) => {
        const newFavs = new Set(prevFavs);
        if (isFav) newFavs.delete(doi);
        else newFavs.add(doi);
        return newFavs;
      });

      setData((prevData) =>
        prevData.map((item) =>
          item["prism:doi"] === doi ? { ...item, isFav: !isFav } : item
        )
      );

      const message = isFav ? "Removed from favorites!" : "Added to favorites!";
      if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert(message);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  }, []);

  // ✅ Scroll to top
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // ✅ Memoized renderItem
  const renderItem = useCallback(
    ({ item }) => (
      <ItemCard
        item={item}
        isFav={item.isFav}
        toggleFavorite={() => toggleFavorite(item["prism:doi"], item.isFav)}
      />
    ),
    [toggleFavorite]
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item["prism:doi"] || `no-doi-${item.id}`}
        ListEmptyComponent={!loading && <FillerComponent />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => fetchData(currentPage + 1, true)}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : null
        }
        initialNumToRender={10}
        windowSize={5}
        removeClippedSubviews={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        ListHeaderComponent={
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search books..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => fetchData(0)}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => fetchData(0)}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                icons.search
              )}
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Scroll to Top Button */}
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
  );
};

export default BasicSearch;
