import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/apiService";

interface NewsItem {
    Id: number;
    Title: string;
    Content: string;
    PublishDate: string;
  }

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        const response = await api.get(`/news/${id}`);
        setNewsItem(response.data);
      } catch (error) {
        console.error("Kunde inte hämta nyhet", error);
      }
    };

    if (id) {
      fetchNewsItem();
    }
  }, [id]);

  if (!newsItem) return <p>Laddar nyhet...</p>;

  return (
    <div>
    <h1>{newsItem.Title}</h1>
    <small>Publicerad: {new Date(newsItem.PublishDate).toLocaleDateString()}</small>
    <p>{newsItem.Content}</p>
    
  </div>
  );
};

export default NewsDetail;
