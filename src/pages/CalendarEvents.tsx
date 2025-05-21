import { useEffect, useState } from "react";
import api from "../services/apiService";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import '../pages/CalendarEvents.scss'
import { useToast } from "../components/ToastContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import 'react-calendar/dist/Calendar.css';
import CalendarWidget from "../components/CalendarWidget";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<{ startDate: string }[]>([]);
  const { role, isLoggedIn } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/calendar");
        const transformed = response.data.map((e: any) => ({
          id: e.id,
          title: e.title,
          content: e.content,
          startDate: e.startDate,
        }));

        setCalendarEvents(transformed);
        const today = new Date();
        const upcoming = transformed
          .filter((e: CalendarEvent) => new Date(e.startDate) >= today)
          .sort((a: CalendarEvent, b: CalendarEvent) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );

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
      showToast("Ändringar sparade!", "success");
      window.dispatchEvent(new Event("calendarUpdated"));
    } catch (error) {
      console.error("Kunde inte spara ändringar", error);
      showToast("Kunde inte spara ändringar", "error");
    }
  };


  //Funktion att ta bort event
  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      await api.delete(`/calendar/${pendingDeleteId}`);
      setEvents(prev => prev.filter(e => e.id !== pendingDeleteId));
      showToast("Kalenderhändelsen borttagen!", "success");
      window.dispatchEvent(new Event("calendarUpdated"));
    } catch (error) {
      console.error("Kunde inte ta bort kalenderhändelsen", error);
      showToast("Kunde inte ta bort kalenderhändelsen", "error");
    } finally {
      setShowConfirmModal(false);
      setPendingDeleteId(null);
    }
  };

  //Kalender
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const isoDate = date.toLocaleDateString("sv-SE").replaceAll(".", "-");
    navigate(`/calendar/${isoDate}`);
  };

  return (
    <div className="calendar-events">

      {/* Kalendern */}
      <div className="mobile-calendar">
        <CalendarWidget
          events={calendarEvents}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
        />
      </div>

      <h1>Kommande kalenderhändelser</h1>
      {isLoggedIn && role === "admin" && (
        <button className="btn add_btn" onClick={() => navigate("/admin", { state: { openAddEvent: true } })}>
          + Lägg till ny kalenderhändelse
        </button>
      )}

      <ul>
        {events.map(event => (
          <li key={event.id}>

            <strong
              contentEditable={editingId === event.id}
              suppressContentEditableWarning={true}
              spellCheck={false}
              onInput={(e) => setEditedTitle((e.target as HTMLElement).innerText)}
              tabIndex={0}>
              {event.title}
            </strong>

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
                    <button className="btn green_btn" onClick={() => handleSave(event.id)}>Spara</button>
                    <button className="btn cancel_btn" onClick={() => setEditingId(null)}>Avbryt</button>
                  </>
                ) : (
                  <>
                    <button
                     className="btn edit_btn"
                      onClick={() => {
                        setEditingId(event.id);
                        setEditedTitle(event.title);
                        setEditedContent(event.content);
                        setEditedStartTime(event.startDate?.split("T")[1]?.slice(0, 5) || "");
                      }}
                    >
                      Redigera
                    </button>
                    <button className="btn cancel_btn" onClick={() => handleDelete(event.id)}>Ta bort</button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {showConfirmModal && (
        <ConfirmDeleteModal
          message="Är du säker på att du vill ta bort denna händelse?"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmModal(false);
            setPendingDeleteId(null);
          }}
        />
      )}

    </div>
  )
}

export default CalendarEvents
