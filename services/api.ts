import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    "";

  const host = hostUri.split(":")[0];

  if (host) {
    return `http://${host}:3000`;
  }

  return "http://localhost:3000";
};

export const API_BASE_URL = getApiBaseUrl();
