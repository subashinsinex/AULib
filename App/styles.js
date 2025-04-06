import { StyleSheet } from "react-native";
import colors from "./constants/colors";
import dimensions from "./constants/dimensions";

export default StyleSheet.create({
  activeSearchNavButton: {
    backgroundColor: colors.primary,
  },
  activeSearchNavText: {
    color: "#fff",
  },
  activeTab: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  advancedSearchButton: {
    marginLeft: 10,
    marginRight: 5,
    backgroundColor: colors.primary,
    height: 45,
    width: 45,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  advancedSearchContainer: {
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  advancedSearchInput: {
    flex: 1,
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    marginHorizontal: 5,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.red,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "relative",
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 7,
    backgroundColor: colors.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    width: dimensions.cardWidth,
    elevation: 3,
    alignItems: "center",
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
  chartTitle: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  favButton: {
    marginEnd: 10,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 45,
    height: 45,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  greeting: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: 10,
  },
  itemAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  itemContent: {
    flex: 1,
  },
  itemDetails: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  itemJournal: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 6,
    fontWeight: "500",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
    lineHeight: 24,
  },
  loader: {
    marginVertical: 20,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    color: "#ff0000",
  },
  openAccessBadge: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  openAccessText: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "500",
  },
  rightIcons: {
    flexDirection: "row",
    gap: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    height: 45,
    width: 45,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  searchGif: {
    width: 200,
    height: 200,
    backgroundColor: "transparent",
  },
  searchGifContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  searchNavButton: {
    padding: 10,
    borderRadius: 5,
  },
  searchNavContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#E0E0E0",
    paddingVertical: 10,
  },
  searchNavText: {
    fontSize: 16,
    color: "#000",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#E0E0E0",
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  topBarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    justifyContent: "center",
  },
  LoginContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  LoginContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  LoginLogo: {
    width: 125,
    height: 125,
    marginBottom: 30,
  },
  LoginTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  LoginSubtitle: {
    fontSize: 16,
    color: "#dfe6e9",
    marginBottom: 30,
  },
  LoginError: {
    color: colors.red,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  LoginInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 15,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  LoginInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 10,
    color: "#333",
  },
  LoginButton: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  LoginButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
});
