import { Alert } from "react-native";

export const showNotificationPopup = ({ title, body }) => {
  Alert.alert(title, body, [
    { text: "OK" }
  ]);
};