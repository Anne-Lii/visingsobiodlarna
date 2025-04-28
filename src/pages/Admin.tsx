import { useEffect, useState } from "react";
import api from "../services/apiService";

interface PendingUser {
    id: string;
    email: string;
    fullName: string;
}

const Admin = () => {
    //states
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
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

    return (
        <div>
            <h1>Administrera användare</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {pendingUsers.length === 0 ? (
                <p>Inga användare väntar på godkännande.</p>
            ) : (
                <ul>
                    {pendingUsers.map(user => (
                        <li key={user.id}>
                            {user.fullName || "Namn saknas"} ({user.email || "E-post saknas"})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Admin
