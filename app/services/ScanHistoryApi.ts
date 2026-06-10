import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://black-cat.up.railway.app";

export const getAllScans = async (
  page: number,
  limit: number
) => {
  try {

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    if (!token) {
      throw new Error(
        "No access token found"
      );
    }

    const response =
      await axios.get(
        `${API_URL}/scan`,
        {
          params: {
            page,
            limit,
          },

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;

  } catch (error) {

    console.log(
      "Get scans error:",
      error
    );

    throw error;
  }
};