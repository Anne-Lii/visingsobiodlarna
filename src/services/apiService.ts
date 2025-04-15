import axios from "axios";

const api = axios.create({
  baseURL: "https://visingsobiodlarna-api.azurewebsites.net/api",
});

//Lägg till token automatiskt om den finns
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
