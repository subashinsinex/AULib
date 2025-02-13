import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Text,
  Keyboard,
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
  const [totalResults, setTotalResults] = useState(0);
  const itemsPerPage = 25;
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchData = async (page = 0, isLoadMore = false) => {
    if (!query.trim()) {
      setMessage("");
      setData([]);
      return;
    }

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setData([]); // Reset data when making a new search
    }

    Keyboard.dismiss();

    try {
      const startIndex = page * itemsPerPage;
      const response = await axios.get(
        `http://${secret.Server_IP}:${secret.Server_Port}/fetch`,
        {
          params: { query, startIndex, itemsPerPage },
        }
      );

      const results = response.data?.["search-results"]?.entry || [];
      setTotalResults(
        parseInt(
          response.data?.["search-results"]["opensearch:totalResults"] || "0"
        )
      );

      if (isLoadMore) {
        setData((prevData) => [...prevData, ...results]);
      } else {
        setData(results);
      }

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

  const loadMoreData = () => {
    if (!loadingMore && (currentPage + 1) * itemsPerPage < totalResults) {
      fetchData(currentPage + 1, true);
    }
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => <ItemCard item={item} />}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={!loading && <FillerComponent />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
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
              {icons.search}
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
