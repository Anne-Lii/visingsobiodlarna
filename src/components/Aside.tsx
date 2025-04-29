import { useEffect, useState } from "react";
import api from "../services/apiService";
import { NavLink } from "react-router-dom";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

interface NewsItem {
  Id: number;
  Title: string;
  Content: string;
  PublishDate: string;
}

const Aside = () => {

  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get<NewsItem[]>("/news");
        const sortedNews = response.data
          .sort((a, b) => new Date(b.PublishDate).getTime() - new Date(a.PublishDate).getTime())
          .slice(0, 3); // Bara tre senaste
        setLatestNews(sortedNews);
      } catch (error) {
        console.error("Kunde inte hämta nyheter", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <aside className="aside">
      <h2>Svärmtelefon!</h2>
      <p>070-589 48 75</p>

      <h3>Kalender</h3>
      <Calendar />

      <h3>Senaste nyheterna</h3>
      <ul>
        {latestNews.map(news => (
          <li key={news.Id}>
            <NavLink to={`/news/${news.Id}`}>
              {news.Title}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Aside;
