import { useEffect, useState } from "react";
import api from "../services/apiService";

interface CalendarEvent {
  id: number;
  title: string;
  startDate: string;
}

const CalendarEvents = () => {

  //states
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/calendar");

        const transformed: CalendarEvent[] = response.data.map((e: any) => ({
          id: e.Id,
          title: e.Title,
          startDate: e.StartDate,
        }));

        //filtrerar och sorterar alla events
        const today = new Date();
        const upcoming = transformed
          .filter(e => new Date(e.startDate) >= today)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());


        setEvents(upcoming);
      } catch (error) {
        console.error("Kunde inte hämta kalenderhändelser", error);
      }
    };

    fetchEvents();
  }, []);



  return (
    <div className="calendar-events">
      <h1>Kommande kalenderhändelser</h1>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            {event.title}

          </li>
        ))}
      </ul>
    </div>
  )
}

export default CalendarEvents
