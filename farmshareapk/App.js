// App.js
import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { LanguageProvider } from "./src/context/LanguageContext";

import "./src/i18n/i18n";

import * as Notifications from "expo-notifications";

import {
  registerForPushNotificationsAsync,
} from "./src/services/notificationService";

export default function App() {
  const navigationRef = useRef(null);

  /* ================= REGISTER PUSH TOKEN ================= */
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  /* ================= NOTIFICATION HANDLER ================= */
  useEffect(() => {
    // Foreground notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // When user taps notification
    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data =
            response.notification.request.content.data;

          const bookingId = data?.bookingId;

          if (bookingId && navigationRef.current) {
            navigationRef.current.navigate(
              "ProviderBookingRequests",
              {
                bookingId,
              }
            );
          }
        }
      );

    return () => subscription.remove();
  }, []);

  return (
    <LanguageProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </LanguageProvider>
  );
}