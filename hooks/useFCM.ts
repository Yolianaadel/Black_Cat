import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
} from "@react-native-firebase/messaging";

import { getApp } from "@react-native-firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";

export const useFCM = (userId: number | string) => {
  useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);

    const init = async () => {
      try {
        await requestPermission(messaging);

        const token = await getToken(messaging);

        await AsyncStorage.setItem("fcm_token", token);

        console.log("FCM TOKEN:", token);
      } catch (e) {
        console.error("FCM error:", e);
      }
    };

    init();

    const unsubscribeForeground = onMessage(
      messaging,
      async (remoteMessage) => {
        const { Alert } = require("react-native");
        Alert.alert(
          remoteMessage.notification?.title || "New Notification!",
          remoteMessage.notification?.body || ""
        );
      }
    );

    const unsubscribeBackground = onNotificationOpenedApp(
      messaging,
      (remoteMessage) => {
        const scanId = remoteMessage?.data?.scanId;
        if (scanId) {
          router.push({
            pathname: "/tools/dashboard",
            params: { scanId: String(scanId) },
          });
        }
      }
    );

    getInitialNotification(messaging).then((remoteMessage) => {
      if (remoteMessage) {
        const scanId = remoteMessage?.data?.scanId;
        if (scanId) {
          router.push({
            pathname: "/tools/dashboard",
            params: { scanId: String(scanId) },
          });
        }
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

};