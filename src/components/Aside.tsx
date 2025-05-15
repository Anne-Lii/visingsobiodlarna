import { useEffect, useState } from "react";
import api from "../services/apiService";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import '../components/Aside.scss'

interface NewsItem {
  id: number;
  title: string;
  content: string;
  publishDate: string;
}

interface FeedItem {
  id: number;
  title: string;
  type: 'news' | 'event';
  date: string; //ISO-format
}


const Aside = () => {

  //states
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [combinedFeed, setCombinedFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
  const fetchData = async () => {
  try {
    const [newsResponse, calendarResponse] = await Promise.all([
      api.get<NewsItem[]>("/news"),
      api.get<any[]>("/calendar"),
    ]);

    const newsItems: FeedItem[] = newsResponse.data.map(news => ({
      id: news.id,
      title: news.title,
      type: 'news',
      date: news.publishDate,
    }));

    const eventItems: FeedItem[] = calendarResponse.data.map(event => ({
      id: event.id,
      title: event.title,
      type: 'event',
      date: event.startDate,
    }));

    const combined = [...newsItems, ...eventItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setCombinedFeed(combined.slice(0, 3));

    // ✅ Lägg till detta:
    const transformedCalendar = calendarResponse.data.map(event => ({
      ...event,
      startDate: event.startDate,
      endDate: event.endDate,
    }));
    setCalendarEvents(transformedCalendar);

  } catch (error) {
    console.error("Kunde inte hämta nyheter eller kalenderhändelser", error);
  }
};

  fetchData();

  const handleNewsUpdated = () => {
    fetchData();
  };
  const handleEventsUpdated = () => {
    fetchData();
  };

  window.addEventListener("newsUpdated", handleNewsUpdated);
  window.addEventListener("calendarUpdated", handleEventsUpdated);

  return () => {
    window.removeEventListener("newsUpdated", handleNewsUpdated);
    window.removeEventListener("calendarUpdated", handleEventsUpdated);
  };
}, []);


  //funktion som kontrollerar om ett datum har en händelse och lägger till understrucken markering
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
        return <div className="event-underline"></div>;
      }
    }
    return null;
  };

  //funktion som kontrollerar om ett datum har en händelse och lägger till bakgrundsfärg
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasEvent = calendarEvents.some(event => {
        const eventDate = new Date(event.startDate);
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      });

      if (hasEvent) {
        return 'event-day';//lägger till klass till dag med event
      }
    }
    return null;
  };

  //gör datumet klickbart för att visa aktuella händelser den dagen
  const navigate = useNavigate();
  const location = useLocation();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date); // Sätt vald datum först!
    const isoDate = date.toLocaleDateString("sv-SE").replaceAll(".", "-");
    navigate(`/calendar/${isoDate}`);
  };

  //Plockar ut datumet om man är på en kalender-dagsvy
  const match = location.pathname.match(/^\/calendar\/(\d{4}-\d{2}-\d{2})$/);
  const initialDate = match ? new Date(match[1]) : new Date();

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  return (
    <aside className="aside">
      <h2>Svärmtelefon!</h2>
      <p className="phone_swarm">Thomas Hansen 070-589 48 75</p>

      <h3>Kalender</h3>
      <Calendar onClickDay={handleDateClick} tileContent={tileContent} value={selectedDate} tileClassName={tileClassName} />
      <NavLink to="/calendar" className="calendar-link">
        Visa alla kalenderhändelser
      </NavLink>
      <h3>Senaste nytt</h3>
<ul>
  {combinedFeed.map(item => (
    <li key={`${item.type}-${item.id}`}>
      <NavLink to={item.type === 'news' ? `/news/${item.id}` : `/calendar/${item.date.slice(0, 10)}`}>
        {item.title}
      </NavLink>
    </li>
  ))}
</ul>
    </aside>
  )
}

export default Aside;
