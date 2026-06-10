import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  "https://black-cat.up.railway.app";

const getToken = async () => {

  const token =
    await AsyncStorage.getItem(
      "access_token"
    ) ||
    await AsyncStorage.getItem(
      "token"
    ) ||
    await AsyncStorage.getItem(
      "userToken"
    );

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


export const getScanResult =
async (
scanId:string
)=>{

const token=
await getToken();

return axios.get(

`${API_BASE_URL}/scan/${scanId}/result`,

{

headers:{

Authorization:
`Bearer ${token}`

}

}

);

};


export const getScanVulnerabilities =
async(

scanId:string,

page=1,

limit=10

)=>{

const token=
await getToken();

return axios.get(

`${API_BASE_URL}/scan/${scanId}/vulnerabilities`,

{

params:{

page,
limit

},

headers:{

Authorization:
`Bearer ${token}`

}

}

);

};