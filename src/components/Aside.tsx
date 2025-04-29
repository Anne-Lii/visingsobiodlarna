import { useEffect, useState } from "react";
import api from "../services/apiService";
import { NavLink, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import '../components/Aside.scss'

interface NewsItem {
  Id: number;
  Title: string;
  Content: string;
  PublishDate: string;
}


const Aside = () => {

  //Hämtar nyheter
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get<NewsItem[]>("/news");
        const sortedNews = response.data
          .sort((a, b) => new Date(b.PublishDate).getTime() - new Date(a.PublishDate).getTime())
          .slice(0, 3); //Bara de tre senaste
        setLatestNews(sortedNews);
      } catch (error) {
        console.error("Kunde inte hämta nyheter", error);
      }
    };

    fetchNews();
  }, []);

  //Hämtar kalenderevents
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const response = await api.get("/calendar");

        //PascalCase -> camelCase
        const transformed = response.data.map((event: any) => ({
          id: event.Id,
          title: event.Title,
          content: event.Content,
          startDate: event.StartDate,
          endDate: event.EndDate
        }));

        setCalendarEvents(transformed);
      } catch (error) {
        console.error("Kunde inte hämta kalenderhändelser", error);
      }
    };

    fetchCalendarEvents();
  }, []);

  //funktion som kontrollerar om ett datum har en händelse
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {

      //Kollar om det finns något event på detta datum
      const hasEvent = calendarEvents.some(event => {
        const eventDate = new Date(event.startDate);
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      });

      if (hasEvent) {
        return <div className="event-dot"></div>; //En liten prick under siffran
      }
    }
    return null;
  };

  //gör datumet klickbart för att visa aktuella händelser den dagen
  const navigate = useNavigate();

  const handleDateClick = (date: Date) => {
    const isoDate = date.toLocaleDateString("sv-SE").replaceAll(".", "-"); //ex 2025-04-30
    navigate(`/calendar/${isoDate}`);
  };



  return (
    <aside className="aside">
      <h2>Svärmtelefon!</h2>
      <p>070-589 48 75</p>

      <h3>Kalender</h3>
      <Calendar tileContent={tileContent} onClickDay={handleDateClick}/>

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
