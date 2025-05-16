import { useEffect, useState } from "react";
import api from "../services/apiService";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import '../components/Aside.scss'
import { NewsItem, useNews } from "../context/NewsContext";
import DocumentsSection from "./DocumentSection";
import { useUser } from "../context/UserContext";





interface FeedItem {
  id: number;
  title: string;
  type: 'news' | 'event';
  date: string; //ISO-format
}

const Aside = () => {

  //states
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [combinedFeed, setCombinedFeed] = useState<FeedItem[]>([]);
  const { news } = useNews();

  //gör datumet klickbart för att visa aktuella händelser den dagen
  const navigate = useNavigate();
  const location = useLocation();
  const match = location.pathname.match(/^\/calendar\/(\d{4}-\d{2}-\d{2})$/); // ⬅ FLYTTAD HIT

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return match ? new Date(match[1]) : new Date();
  });

  const { role, isLoggedIn } = useUser();
  const isAdmin = role === "admin";

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const calendarResponse = await api.get("/calendar");

        const eventItems: FeedItem[] = calendarResponse.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          type: 'event',
          date: event.publishDate,
        }));

        const newsItems: FeedItem[] = news.map((n) => ({
          id: n.id,
          title: n.title,
          type: 'news',
          date: n.publishDate,
        }));

        const combined = [...newsItems, ...eventItems].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setCombinedFeed(combined.slice(0, 3));
        const transformedCalendar = calendarResponse.data.map((event: any) => ({
          ...event,
          startDate: event.startDate,
          endDate: event.endDate,
        }));
        setCalendarEvents(transformedCalendar);
      } catch (error) {
        console.error("Kunde inte hämta kalenderhändelser", error);
      }
    };

    fetchCalendar();
  }, [news]);



  //funktion som kontrollerar om ett datum har en händelse och lägger till understrucken markering
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasEvent = calendarEvents.some(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === date.toDateString();
      });
      return hasEvent ? <div className="event-underline"></div> : null;
    }
    return null;
  };

  //funktion som kontrollerar om ett datum har en händelse och lägger till bakgrundsfärg
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasEvent = calendarEvents.some(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === date.toDateString();
      });
      return hasEvent ? 'event-day' : null;
    }
    return null;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const isoDate = date.toLocaleDateString("sv-SE").replaceAll(".", "-");
    navigate(`/calendar/${isoDate}`);
  };

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

      <DocumentsSection isAdmin={isAdmin} />

    </aside>
  )
}

export default Aside;
