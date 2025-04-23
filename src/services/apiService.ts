import axios from "axios";

const api = axios.create({
  baseURL: "https://visingsobiodlarna-api.azurewebsites.net/api",
  withCredentials:true, //cookies (JWT) skickas automatiskt med varje request
});

export default api;
