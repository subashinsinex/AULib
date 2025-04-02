import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
} from "react-native";
import axios from "axios";
import colors from "../constants/colors";
import styles from "../styles";
import TopBar from "../components/TopBar";
import ItemResources from "../components/ItemResources";
import secret from "../constants/secret";
import { AuthContext } from "../constants/AuthContext";
import icons from "../constants/icons";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { accessToken } = useContext(AuthContext);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get(
          `http://${secret.Server_IP}:${secret.Server_Port}/eresources/`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setResources(response.data);
        setFilteredResources(response.data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const trimmedText = searchText.trim();
    if (!trimmedText) {
      setFilteredResources(resources);
    } else {
      const lowercasedText = trimmedText.toLowerCase();
      setFilteredResources(
        resources.filter(
          (item) =>
            item.title && item.title.toLowerCase().includes(lowercasedText) // ||
          // (item.author && item.author.toLowerCase().includes(lowercasedText))
        )
      );
    }
  }, [searchText, resources]);

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderItem = useCallback(
    ({ item }) => <ItemResources item={item} />,
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <TopBar title="Resources" />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ flex: 1, justifyContent: "center" }}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredResources}
          renderItem={renderItem}
          keyExtractor={(item) => item.res_id.toString()}
          contentContainerStyle={{ paddingBottom: 10 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search by title"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={() => {
                  setSearchText(searchText.trim());
                  Keyboard.dismiss();
                }}
                returnKeyType="search"
              />
            </View>
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      )}

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
    </SafeAreaView>
  );
}
