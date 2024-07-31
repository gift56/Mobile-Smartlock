import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

const LOCK_TIME = 5000;

export const UserInactivityProvider = ({ children }: any) => {
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: any) => {
    console.log("appState", appState.current, nextAppState);
    if (appState.current.match(/inactive/)) {
      router.push("/(modals)/white");
    } else {
      if (router.canGoBack()) {
        router.back();
      }
    }

    if (nextAppState === "background") {
      recordStartTime();
    } else if (
      nextAppState === "active" &&
      appState.current.match(/background/)
    ) {
      const startTime = await AsyncStorage.getItem("startTime");
      if (startTime !== null) {
        const elapsed = Date.now() - (JSON.parse(startTime) || 0);
        console.log("Elapsed time:", elapsed);
        if (elapsed > LOCK_TIME) {
          router.push("/(modals)/lock");
        }
      }
    }
    appState.current = nextAppState;
  };

  const recordStartTime = async () => {
    try {
      await AsyncStorage.setItem("startTime", JSON.stringify(Date.now()));
    } catch (error) {
      console.error("Failed to save start time", error);
    }
  };

  return children;
};
