import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://black-cat.up.railway.app";

const getToken = async () => {

  const token =
    (await AsyncStorage.getItem("accessToken")) ||
    (await AsyncStorage.getItem("token")) ||
    (await AsyncStorage.getItem("userToken")) ||
    (await AsyncStorage.getItem("access_token"));

  if (
    !token ||
    token === "null" ||
    token === "undefined"
  ) {
    return "";
  }

  return token
    .replace(
      /^Bearer\s+/i,
      ""
    )
    .trim();
};

const authHeaders = async () => {

  const token =
    await getToken();

  return {
    Authorization:
      `Bearer ${token}`,
  };
};

export type ReportRiskType =
  | "All"
  | "High"
  | "Medium"
  | "Low";


export const generateReport =
async (
scanId:string,
typeOfRisk:ReportRiskType
)=>{

return axios.post(

`${API_URL}/reports/${scanId}/generate`,

null,

{

params:{
typeOfRisk
},

headers:
await authHeaders()

}

);

};


export const getReportStatus =
async(
reportId:string
)=>{

return axios.get(

`${API_URL}/reports/${reportId}/status`,

{

headers:
await authHeaders()

}

);

};


export const getReportsByScan =
async(
scanId:string
)=>{

return axios.get(

`${API_URL}/reports/scan/${scanId}`,

{

headers:
await authHeaders()

}

);

};


export const deleteReport =
async(
reportId:string
)=>{

return axios.delete(

`${API_URL}/reports/${reportId}`,

{

headers:
await authHeaders()

}

);

};