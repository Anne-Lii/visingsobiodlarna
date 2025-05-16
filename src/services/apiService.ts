import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true, //cookies (JWT) skickas automatiskt med varje request
  headers: {
    "Content-Type": "application/json"
  }
});

export const fetchDocuments = () => api.get("/documents");

export const uploadDocument = (formData: FormData) =>
  api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const deleteDocument = (id: number) =>
  api.delete(`/documents/${id}`);

export const getDownloadLink = (id: number) =>
  api.get(`/documents/${id}/downloadlink`);

export default api;

