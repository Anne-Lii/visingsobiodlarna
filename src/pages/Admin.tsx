import { useEffect, useState } from "react";
import api from "../services/apiService";
import '../pages/Admin.scss'


interface PendingUser {
    id: string;
    email: string;
    fullName: string;
}

const Admin = () => {
    //states
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [showAddEventForm, setShowAddEventForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        content: "",
        startDate: "",
        startTime: "",
        endDate: ""
    });
    const [error, setError] = useState<string | null>(null);

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

            const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}`); //Kombinerar datum och tid

            await api.post("/calendar", {
                title: newEvent.title,
                content: newEvent.content,
                startDate: startDateTime.toISOString(),
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
        } catch (error) {
            console.error("Kunde inte lägga till kalenderhändelse", error);
        }
    }

    return (
        <div className="admin-container">
            <h1>Administrera användare</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {pendingUsers.length === 0 ? (
                <p>Inga användare väntar på godkännande.</p>
            ) : (
                <ul>
                    {pendingUsers.map(user => (
                        <li key={user.id}>
                            {user.fullName || "Namn saknas"} ({user.email || "E-post saknas"})
                            {/* Knapp för att godkänna användaren */}
                            <button onClick={() => approveUser(user.id)}>Godkänn</button>
                            {/* Knapp för att ta bort användaren */}
                            <button onClick={() => deleteUser(user.id)}>Ta bort</button>
                        </li>
                    ))}
                </ul>
            )}

            <button onClick={() => addEvent()}>+ Lägg till kalenderhändelse</button>

            {showAddEventForm && (
                <div className="add-event-form">
                    <h2>Ny kalenderhändelse</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Titel"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Beskrivning"
                            value={newEvent.content}
                            onChange={(e) => setNewEvent({ ...newEvent, content: e.target.value })}
                        />
                        <input
                            type="date"
                            value={newEvent.startDate}
                            onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                            required
                        />
                        <input
                            type="time"
                            value={newEvent.startTime}
                            onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        />
                        <input
                            type="date"
                            value={newEvent.endDate}
                            onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                        />
                        <button type="submit">Spara händelse</button>
                        <button type="button" onClick={() => setShowAddEventForm(false)}>Avbryt</button>
                    </form>
                </div>
            )}

        </div>
    )
}

export default Admin
