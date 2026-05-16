import AsyncStorage from "@react-native-async-storage/async-storage";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; 

export const refreshTokenIfNeeded = async (): Promise<string | null> => {
  try {
    const loginDate = await AsyncStorage.getItem("login_date");
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    if (!loginDate || !refreshToken) return null;

    const elapsed = Date.now() - parseInt(loginDate);

    if (elapsed >= SEVEN_DAYS) {
      const response = await fetch(
        "https://black-cat.up.railway.app/user/refresh-token",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        await AsyncStorage.clear();
        return null;
      }

      const { access_token, refresh_token } = data.data.credentials;
      await AsyncStorage.setItem("access_token", access_token);
      await AsyncStorage.setItem("refresh_token", refresh_token);
      await AsyncStorage.setItem("login_date", Date.now().toString());

      return access_token;
    }

    return await AsyncStorage.getItem("access_token");
  } catch (error) {
    console.log("Refresh token error:", error);
    return null;
  }
};