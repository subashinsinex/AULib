import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "../constants/AuthContext";
import { jwtDecode } from "jwt-decode";

const ActiveTimer = () => {
  const { accessToken, refreshAccessToken } = useContext(AuthContext);
  const [expCountdown, setExpCountdown] = useState(null);

  useEffect(() => {
    const refreshOnStart = async () => {
      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken);
          const expiration = decoded.exp * 1000;
          const remainingSeconds = Math.floor((expiration - Date.now()) / 1000);
          setExpCountdown(remainingSeconds);

          if (remainingSeconds <= 15) {
            await refreshAccessToken();
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };

    refreshOnStart();
  }, [accessToken]);

  useEffect(() => {
    if (expCountdown === null) return;

    const timer = setInterval(async () => {
      setExpCountdown((prev) => (prev > 0 ? prev - 1 : 0));

      if (expCountdown === 30) {
        await refreshAccessToken();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expCountdown]);

  return null;
};

export default ActiveTimer;
