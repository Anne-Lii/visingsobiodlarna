import { useEffect, useState } from "react";
import api from "../services/apiService";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import '../pages/CalendarEvents.scss'

interface CalendarEvent {
  id: number;
  title: string;
  content: string;
  startDate: string;
}

const CalendarEvents = () => {

  //states
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedStartTime, setEditedStartTime] = useState("");
  const navigate = useNavigate();
  const { role, isLoggedIn } = useUser();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/calendar");
        const transformed: CalendarEvent[] = response.data.map((e: any) => ({
          id: e.Id,
          title: e.Title,
          content: e.Content,
          startDate: e.StartDate,
        }));

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

  //spara redigerat event
  const handleSave = async (id: number) => {
    const eventToUpdate = events.find(e => e.id === id);
    if (!eventToUpdate) return;
  
    const datePart = eventToUpdate.startDate.split("T")[0];
    const newStart = editedStartTime ? `${datePart}T${editedStartTime}` : eventToUpdate.startDate;
  
    try {
      await api.put(`/calendar/${id}`, {
        id: id,
        title: editedTitle,
        content: editedContent,
        startDate: newStart
      });
  
      setEvents(prev =>
        prev.map(e =>
          e.id === id ? { ...e, title: editedTitle, content: editedContent, startDate: newStart } : e
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Kunde inte spara ändringar", error);
      alert("Kunde inte spara ändringar.");
    }
  };
  

  //Funktion att ta bort event
  const handleDelete = async (id: number) => {
    if (!window.confirm("Är du säker på att du vill ta bort denna händelse?")) return;

    try {
      await api.delete(`/calendar/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error("Kunde inte ta bort kalenderhändelsen", error);
    }
  };

  return (
    <div className="calendar-events">
      <h1>Kommande kalenderhändelser</h1>
      {isLoggedIn && role === "admin" && (
        <button onClick={() => navigate("/admin", { state: { openAddEvent: true } })}>
          + Lägg till ny kalenderhändelse
        </button>
      )}

      <ul>
        {events.map(event => (
          <li key={event.id}>
            <small>
              {new Date(event.startDate).toLocaleDateString("sv-SE")} kl.{" "}
              {new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </small>

            {editingId === event.id && (
  <div className="time-input">
    <label>
      Starttid:{" "}
      <input
        type="time"
        value={editedStartTime}
        onChange={(e) => setEditedStartTime(e.target.value)}
      />
    </label>
  </div>
)}

            <strong
              contentEditable={editingId === event.id}
              suppressContentEditableWarning={true}
              onInput={(e) => setEditedTitle((e.target as HTMLElement).innerText)}
            >
              {event.title}
            </strong>
            <br />
            <p
              contentEditable={editingId === event.id}
              suppressContentEditableWarning={true}
              onInput={(e) => setEditedContent((e.target as HTMLElement).innerText)}
            >
              {event.content}
            </p>

            {isLoggedIn && role === "admin" && (
              <div className="admin-buttons-calendar">
                {editingId === event.id ? (
                  <>
                    <button onClick={() => handleSave(event.id)}>Spara</button>
                    <button onClick={() => setEditingId(null)}>Avbryt</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(event.id);
                        setEditedTitle(event.title);
                        setEditedContent(event.content);
                        setEditedStartTime(event.startDate?.split("T")[1]?.slice(0, 5) || "");
                      }}
                    >
                      Redigera
                    </button>
                    <button onClick={() => handleDelete(event.id)}>Ta bort</button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>


    </div>
  )
}

export default CalendarEvents
