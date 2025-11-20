import { useEffect, useState } from "react";
import api from "../services/apiService";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import 'react-calendar/dist/Calendar.css';
import '../components/Aside.scss'
import { useNews } from "../context/NewsContext";
import DocumentsSection from "./DocumentSection";
import { useUser } from "../context/UserContext";
import CalendarWidget from "./CalendarWidget";

interface FeedItem {
  id: number;
  title: string;
  type: 'news' | 'event';
  date: string; //ISO-format
}

const Aside = () => {

  //states
  const [calendarEvents, setCalendarEvents] = useState<{ startDate: string }[]>([]);
  const [combinedFeed, setCombinedFeed] = useState<FeedItem[]>([]);
  const { news } = useNews();

  //gör datumet klickbart för att visa aktuella händelser den dagen
  const navigate = useNavigate();
  const location = useLocation();
  const match = location.pathname.match(/^\/calendar\/(\d{4}-\d{2}-\d{2})$/);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (match) {
      const parsed = new Date(match[1]);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  });

  const { role } = useUser();
  const isAdmin = role === "admin";

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const calendarResponse = await api.get("/calendar");

        const eventItems: FeedItem[] = calendarResponse.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          type: 'event',
          date: event.startDate,
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
      <CalendarWidget
        events={calendarEvents}
        selectedDate={selectedDate}
        onDateClick={handleDateClick}
      />
      <NavLink to="/calendar" className="calendar-link">
        Visa alla kalenderhändelser
      </NavLink>

      <h3>Senaste nytt</h3>
      <ul>
        {combinedFeed.map(item => (
          <li key={`${item.type}-${item.id}`}>
            <NavLink
              to={
                item.type === 'news'
                  ? `/news/${item.id}`
                  : item.date && !isNaN(new Date(item.date).getTime())
                    ? `/calendar/${new Date(item.date).toISOString().slice(0, 10)}`
                    : "/calendar"
              }
            >
              {item.title}
            </NavLink>
          </li>
        ))}
      </ul>

      <h3>Dokument</h3>
      <DocumentsSection isAdmin={isAdmin} />

    </aside>
  )
}

export default Aside;
