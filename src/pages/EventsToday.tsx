

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/apiService";

//från backend (PascalCase)
interface RawCalendarEvent {
  Id: number;
  Title: string;
  Content: string;
  StartDate: string;
  EndDate: string | null;
}

//i frontend (camelCase)
interface CalendarEvent {
  id: number;
  title: string;
  content: string;
  startDate: string;
  endDate: string | null;
}

const EventsToday = () => {
  const { date } = useParams(); // Ex: "2025-04-30"
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/calendar");
        const filtered = (response.data as RawCalendarEvent[]).filter(event => {
          const eventDate = new Date(event.StartDate).toLocaleDateString("sv-SE").replaceAll(".", "-");
          return eventDate === date;
        });

        const mapped: CalendarEvent[] = filtered.map(e => ({
          id: e.Id,
          title: e.Title,
          content: e.Content,
          startDate: e.StartDate,
          endDate: e.EndDate,
        }));

        setEvents(mapped);
      } catch (error) {
        console.error("Kunde inte hämta kalenderhändelser", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [date]);

  if (loading) return <p>Laddar händelser...</p>;

  return (
    <div className="day-events">
      <h1>Händelser den {date}</h1>
      {events.length === 0 ? (
        <p>Inga registrerade händelser detta datum.</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event.id}>
              <h3>{event.title}</h3>
              <p>{event.content}</p>
              <small>Start: {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsToday;
