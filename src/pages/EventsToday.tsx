import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/apiService";
import { useUser } from "../context/UserContext";
import '../pages/EventsToday.scss';
import { useToast } from "../components/ToastContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

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

  //states
  const { date } = useParams(); // Ex: "2025-04-30"
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, role } = useUser();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedStartTime, setEditedStartTime] = useState("");
  const [editedEndTime, setEditedEndTime] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const { showToast } = useToast();

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
        showToast("Kunde inte hämta kalenderhändelser", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [date]);

  const handleSave = async (id: number) => {
    const eventToUpdate = events.find(e => e.id === id);
    if (!eventToUpdate) return;

    const datePart = eventToUpdate.startDate.split("T")[0]; // ex: "2025-04-30"

    const newStart = editedStartTime
      ? `${datePart}T${editedStartTime}`
      : eventToUpdate.startDate;

    const newEnd = editedEndTime
      ? `${datePart}T${editedEndTime}`
      : eventToUpdate.endDate;

    try {
      await api.put(`/calendar/${id}`, {
        id,
        title: editedTitle,
        content: editedContent,
        startDate: newStart,
        endDate: newEnd
      });

      setEvents(prev =>
        prev.map(e =>
          e.id === id
            ? { ...e, title: editedTitle, content: editedContent, startDate: newStart, endDate: newEnd }
            : e
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

  //Ta bort en händelse
  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      await api.delete(`/calendar/${pendingDeleteId}`);
      setEvents(prev => prev.filter(e => e.id !== pendingDeleteId));
      showToast("Kalenderhändelse borttagen!", "success");
      window.dispatchEvent(new Event("calendarUpdated"));
    } catch (error) {
      console.error("Kunde inte ta bort kalenderhändelsen", error);
      showToast("Kunde inte ta bort kalenderhändelsen", "error");
    } finally {
      setShowConfirmModal(false);
      setPendingDeleteId(null);
    }
  };

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
              <h2
                contentEditable={editingId === event.id}
                suppressContentEditableWarning={true}
                onInput={(e) => setEditedTitle((e.target as HTMLElement).innerText)}
              >
                {event.title}
              </h2>
              <small>Start: {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
              <p
                contentEditable={editingId === event.id}
                suppressContentEditableWarning={true}
                onInput={(e) => setEditedContent((e.target as HTMLElement).innerText)}
              >
                {event.content}
              </p>
              {editingId === event.id && (
                <div className="time-inputs">
                  <label>
                    Starttid:{" "}
                    <input
                      type="time"
                      value={editedStartTime}
                      onChange={(e) => setEditedStartTime(e.target.value)}
                    />
                  </label>
                  <label>
                    Sluttid:{" "}
                    <input
                      type="time"
                      value={editedEndTime}
                      onChange={(e) => setEditedEndTime(e.target.value)}
                    />
                  </label>
                </div>
              )}

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
                          setEditedEndTime(event.endDate?.split("T")[1]?.slice(0, 5) || "");
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

      )}
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
  );
};

export default EventsToday;
