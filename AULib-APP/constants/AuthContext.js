import React, { createContext, useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import secret from "./secret";

export const AuthContext = createContext();

export const AuthProvider = ({ children, navigationRef }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  const login = async (accessToken, refreshToken, userId) => {
    try {
      await SecureStore.setItemAsync(
        "auth",
        JSON.stringify({ accessToken, refreshToken, userId })
      );
      await SecureStore.setItemAsync("accessToken", accessToken);
      await SecureStore.setItemAsync("refreshToken", refreshToken);

      setUser(userId);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
    } catch (error) {
      console.error("Error storing login data:", error);
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/userAuth/logout`,
        { userId: user }
      );

      if (response.status === 200) {
        await SecureStore.deleteItemAsync("auth");
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");

        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        console.log("User logged out and data cleared");

        if (navigationRef?.current?.isReady()) {
          navigationRef.current.navigate("Login");
        }
      } else {
        console.error("Logout failed on server");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const refreshAccessToken = useCallback(async () => {
    try {
      const storedRefreshToken = await SecureStore.getItemAsync("refreshToken");
      if (!storedRefreshToken) {
        if (navigationRef?.current?.isReady()) {
          navigationRef.current.navigate("Login");
        }
        return;
      }

      const response = await axios.post(
        `http://${secret.Server_IP}:${secret.Server_Port}/userAuth/refresh`,
        { refreshToken: storedRefreshToken }
      );

      const newAccessToken = response.data.accessToken;
      await SecureStore.setItemAsync("accessToken", newAccessToken);
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      if (error.response?.status === 401) {
        console.log("Logging out due to expired tokens");
        logout();
      } else {
        if (navigationRef?.current?.isReady()) {
          navigationRef.current.navigate("Login");
        }
      }
      throw error;
    }
  }, [navigationRef]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authData = await SecureStore.getItemAsync("auth");
        if (authData) {
          const { userId, accessToken, refreshToken } = JSON.parse(authData);
          setUser(userId);
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
