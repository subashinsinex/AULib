import { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import secret from "./secret"; // Assuming secret contains server details
import axios from "axios"; // Assuming you are using axios to make API calls

const ActiveTimer = () => {
  const [refreshToken] = useState(localStorage.getItem("refreshToken")); // Removed unused setter
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
  const [expCountdown, setExpCountdown] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // To track if a refresh is in progress

  // This function handles refreshing the access token
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing) return; // Prevent refreshing if already in progress
    setIsRefreshing(true);

    try {
      const response = await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/userAuth/refresh`,
        { refreshToken }
      );
      const newAccessToken = response.data.accessToken;
      setAccessToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
    } catch (error) {
      console.error("Error refreshing token:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshToken, isRefreshing]); // Added refreshToken to dependencies

  useEffect(() => {
    const refreshOnStart = async () => {
      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken);
          const expiration = decoded.exp * 1000; // Expiration in milliseconds
          const remainingSeconds = Math.floor((expiration - Date.now()) / 1000);
          setExpCountdown(remainingSeconds);

          // If token expires in 15 seconds or less, refresh immediately
          if (remainingSeconds <= 15) {
            await refreshAccessToken();
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };

    refreshOnStart();
  }, [accessToken, refreshAccessToken]); // Added refreshAccessToken to dependencies

  useEffect(() => {
    if (expCountdown === null) return;

    const timer = setInterval(() => {
      setExpCountdown((prev) => (prev > 0 ? prev - 1 : 0));

      // Refresh the token if less than 30 seconds are remaining
      if (expCountdown === 30) {
        refreshAccessToken();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expCountdown, refreshAccessToken]); // Added refreshAccessToken to dependencies

  return null;
};

export default ActiveTimer;
