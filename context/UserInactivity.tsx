import { useRef } from "react";
import { AppState } from "react-native";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({
  id: "UserInactivity",
});

const LOCK_TIME = 5000;

export const UserInactivityProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const appState = useRef(AppState.currentState);
  
  return children;
};
