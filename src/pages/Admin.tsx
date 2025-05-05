import { useEffect, useState } from "react";
import api from "../services/apiService";
import '../pages/Admin.scss'
import { useLocation, useNavigate } from "react-router-dom";


interface PendingUser {
    id: string;
    email: string;
    fullName: string;
}

const Admin = () => {
    //states
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [showAddEventForm, setShowAddEventForm] = useState(false);
    const [startHour, setStartHour] = useState("");
    const [startMinute, setStartMinute] = useState("");
    const [newEvent, setNewEvent] = useState({
        title: "",
        content: "",
        startDate: "",
        startTime: "",
        endDate: ""
    });
    const [showAddNewsForm, setShowAddNewsForm] = useState(false);
    const [newNews, setNewNews] = useState({
        title: "",
        content: ""
    });
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        if (location.state?.openAddEvent) {
            setShowAddEventForm(true);
        }
    }, [location.state]);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const response = await api.get("/admin/pending");
            setPendingUsers(response.data); //Hanterar camelCase från backend
        } catch (error) {
            setError("Kunde inte hämta användare.");
            console.error("Error fetching pending users: ", error);
        }
    };

    //Godkänna användare
    const approveUser = async (userId: string) => {
        try {
            //Skicka PUT-begäran för att godkänna användaren
            await api.put(`/admin/approve/${userId}`);
            //Uppdatera användarlistan efter godkännande
            fetchPendingUsers();
        } catch (error) {
            setError("Kunde inte godkänna användaren.");
            console.error("Error approving user: ", error);
        }
    };

    //Ta bort användare
    const deleteUser = async (userId: string) => {
        try {
            //Skicka DELETE-begäran för att ta bort användaren
            await api.delete(`/admin/delete/${userId}`);
            //Uppdatera användarlistan efter borttagning
            fetchPendingUsers();
        } catch (error) {
            setError("Kunde inte ta bort användaren.");
            console.error("Error deleting user: ", error);
        }
    };

    //Funktion för att öppna modal med formulär
    const addEvent = () => {
        setShowAddEventForm(true);
    }

    //Funktion för att lägga till kalendehändelse
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {

            const startDateTime = `${newEvent.startDate}T${startHour}:${startMinute}`;

            await api.post("/calendar", {
                title: newEvent.title,
                content: newEvent.content,
                startDate: startDateTime,
                endDate: newEvent.endDate || null //Tillåta null om inget slutdatum anges
            });
            alert("Händelsen skapades!");
            setShowAddEventForm(false);
            //Rensar formuläret
            setNewEvent({
                title: "",
                content: "",
                startDate: "",
                startTime: "",
                endDate: ""
            });
            navigate("/calendar");//navigerar till översikten av kalenderhändelser
        } catch (error) {
            console.error("Kunde inte lägga till kalenderhändelse", error);
        }
    }

    const generateHourOptions = () => {
        return Array.from({ length: 24 }, (_, i) => {
            const hh = i.toString().padStart(2, '0');
            return <option key={hh} value={hh}>{hh}</option>;
        });
    };

    const generateMinuteOptions = () => {
        return Array.from({ length: 12 }, (_, i) => {
            const mm = (i * 5).toString().padStart(2, '0');
            return <option key={mm} value={mm}>{mm}</option>;
        });
    };

    const handleNewsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
          await api.post("/news", {
            title: newNews.title,
            content: newNews.content
          });
          alert("Nyheten publicerades!");
          setShowAddNewsForm(false);
          setNewNews({ title: "", content: "" });
          window.dispatchEvent(new Event("newsUpdated"));
        } catch (error) {
          console.error("Kunde inte publicera nyheten", error);
        }
      };

    return (
        <div className="admin-container">
            <h1>Admin</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button onClick={() => setShowAddNewsForm(true)}>+ Lägg till nyhet</button><br></br>
            <button onClick={() => addEvent()}>+ Lägg till kalenderhändelse</button>

            <div className="pendingUser-container">
                <h2>Registreringar som väntar på godkännande:</h2>
                {pendingUsers.length === 0 ? (
                    <p>Inga användare väntar på godkännande.</p>
                ) : (
                    <ul>
                        {pendingUsers.map(user => (
                            <li key={user.id}>
                                {user.fullName || "Namn saknas"} ({user.email || "E-post saknas"})

                                {/* Knapp för att godkänna användaren */}
                                <button className="approveUser_btn" onClick={() => approveUser(user.id)}>Godkänn</button>

                                {/* Knapp för att ta bort användaren */}
                                <button className="deleteUser_btn" onClick={() => deleteUser(user.id)}>Ta bort</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>



            {showAddEventForm && (
                <div className="modal-overlay">
                    <div className="add-event-form">
                        <h2>Ny kalenderhändelse</h2>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="title" id="title">Titel:</label>
                            <input
                                type="text"
                                placeholder="Titel"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                required
                            />
                            <label htmlFor="content" id="content">Beskrivning:</label>
                            <textarea
                                placeholder="Beskrivning"
                                value={newEvent.content}
                                onChange={(e) => setNewEvent({ ...newEvent, content: e.target.value })}
                            />
                            <label htmlFor="time" id="time">Startdatum:</label>
                            <input
                                type="date"
                                value={newEvent.startDate}
                                onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                                required
                            />
                            <label htmlFor="time" id="time">Tid:</label>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>

                                <select value={startHour} onChange={(e) => setStartHour(e.target.value)} required>
                                    <option value="">HH</option>
                                    {generateHourOptions()}
                                </select>
                                :
                                <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)} required>
                                    <option value="">MM</option>
                                    {generateMinuteOptions()}
                                </select>
                            </div>
                            <label htmlFor="endtime" id="endtime">Slutdatum:</label>
                            <input
                                type="date"
                                value={newEvent.endDate}
                                onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                            />
                            <button type="submit">Spara händelse</button>
                            <button type="button" onClick={() => setShowAddEventForm(false)}>Avbryt</button>
                        </form>
                    </div>
                </div>
            )}

            {showAddNewsForm && (
                <div className="modal-overlay">
                    <div className="add-news-form">
                        <h2>Ny nyhet</h2>
                        <form onSubmit={handleNewsSubmit}>
                            <label>Titel:</label>
                            <input
                                type="text"
                                value={newNews.title}
                                onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                                required
                            />
                            <label>Innehåll:</label>
                            <textarea
                                value={newNews.content}
                                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                                required
                            />
                            <button type="submit">Publicera nyhet</button>
                            <button type="button" onClick={() => setShowAddNewsForm(false)}>Avbryt</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Admin
