import axios from "axios";
import { useEffect, useState } from "react";
import '../pages/News.scss'

interface NewsItem {
  Id: number;
  Title: string;
  Content: string;
  PublishDate: string;
}

const News = () => {

  //states
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get<NewsItem[]>(
          `${process.env.REACT_APP_API_BASE_URL}/news`,
          { withCredentials: true }
        );
        console.log("API-svar:", response.data);
        setNewsList(response.data);
      } catch (err) {
        console.error("Kunde inte hämta nyheter", err);
        setError("Kunde inte ladda nyheter just nu.");
      }
    };

    fetchNews();
  }, []);

  

  return (
    <div className="news_container">
    <h1>Nyheter</h1>

    {error && <p style={{ color: "red" }}>{error}</p>}

    {newsList.length === 0 && !error && <p>Inga nyheter att visa.</p>}

    <ul>
  {newsList.map((news) => (
    <li key={news.Id}>
      <strong>{news.Title}</strong> <br />
      <small>{new Date(news.PublishDate).toLocaleDateString()}</small>
      <p>{news.Content}</p>
    </li>
  ))}
</ul>
  </div>
  )
}

export default News
