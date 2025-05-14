import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import api from "../services/apiService";
import '../pages/ApiaryDetails.scss';
import { useToast } from "../components/ToastContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

interface Apiary {
    id: number;
    name: string;
    location: string;
    hiveCount: number;
}

interface Hive {
    id: number;
    name: string;
    apiaryId: number;
    description?: string;
    startYear: number;
}

const ApiaryDetails = () => {

    //states
    const [apiary, setApiary] = useState<Apiary | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedApiary, setEditedApiary] = useState<Apiary | null>(null);
    const [hives, setHives] = useState<Hive[]>([]);
    const [loadingHives, setLoadingHives] = useState(true);
    const [newHiveName, setNewHiveName] = useState("");
    const [newHiveDescription, setNewHiveDescription] = useState("");
    const [showHiveModal, setShowHiveModal] = useState(false);
    const [newHiveStartYear, setNewHiveStartYear] = useState(new Date().getFullYear());
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const { id } = useParams();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
        const shouldRefresh = location.state?.refresh;

        const init = async () => {
            setLoading(true);
            await Promise.all([fetchApiary(), fetchHives()]);
            if (shouldRefresh) {
                window.history.replaceState({}, document.title); //rensa state
            }
        };

        init();
    }, [id, location.state]);

    //hämta bigård
    const fetchApiary = async () => {
        try {
            const response = await api.get(`/apiary/${id}`);
            setApiary(response.data);
            setEditedApiary(response.data);
        } catch (error) {
            console.error("Kunde inte hämta bigård", error);
        } finally {
            setLoading(false);
        }
    };

    //hämta kupor
    const fetchHives = async () => {
        try {
            setLoadingHives(true);
            const response = await api.get(`/hive/by-apiary/${id}`);
            setHives(response.data.sort((a: Hive, b: Hive) => a.name.localeCompare(b.name))); //sorterar listan med kupor i bokstavsordning

        } catch (error) {
            console.error("Kunde inte hämta kupor", error);
        } finally {
            setLoadingHives(false);
        }
    };

    //updaterar bigård
    const handleUpdate = async () => {
        if (!editedApiary) return;
        try {
            await api.put(`/apiary/${editedApiary.id}`, {
                id: editedApiary.id,
                name: editedApiary.name,
                location: editedApiary.location,
                hiveCount: editedApiary.hiveCount,
            });
            setApiary(editedApiary);
            setIsEditing(false);
            showToast("Bigården har uppdaterats.", "success");
        } catch (error) {
            console.error("Kunde inte uppdatera bigård", error);
            showToast("Kunde inte uppdatera bigård", "error");
        }
    };

    //ta bort en bigård
    const handleDelete = () => {
        if (!apiary) return;
        setPendingDeleteId(apiary.id);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!pendingDeleteId) return;
        try {
            await api.delete(`/apiary/${pendingDeleteId}`);
            navigate("/mypage");
            showToast("Bigård borttagen.", "success");
        } catch (error) {
            console.error("Kunde inte radera bigård", error);
            showToast("Kunde inte radera bigård", "error");
        } finally {
            setShowConfirmModal(false);
            setPendingDeleteId(null);
        }
    };

    if (loading) return <p>Laddar bigård...</p>;
    if (!apiary) return <p>Bigården kunde inte hittas.</p>;

    //lägg till ny kupa
    const createHive = async () => {
        if (!id || !newHiveName.trim()) return;
        try {
            const response = await api.post("/hive", {
                name: newHiveName,
                description: newHiveDescription,
                apiaryId: Number(id),
                startYear: newHiveStartYear
            });

            await Promise.all([fetchHives(), fetchApiary()]); //Uppdaterar listan med kupor och hiveCount

            setNewHiveName("");
            setNewHiveDescription("");
            setShowHiveModal(false);
            showToast("Kupa sparad!", "success");
        } catch (error) {
            console.error("Kunde inte lägga till kupa.", error);
            showToast("Kunde inte lägga till kupa.", "error");
        }
    };

    return (
        <div className="apiary_container">

            {/* Detaljer om bigården */}
            <div className="apiary-details">
                <Link to="/mypage" className="back-link">← Tillbaka till Mina sidor</Link>
                <h1>{apiary.name}</h1>


                {isEditing && editedApiary ? (
                    <>
                        <label>Namn:</label>
                        <input
                            value={editedApiary.name}
                            onChange={(e) => setEditedApiary({ ...editedApiary, name: e.target.value })}
                        />
                        <label>Plats:</label>
                        <input
                            value={editedApiary.location}
                            onChange={(e) => setEditedApiary({ ...editedApiary, location: e.target.value })}
                        />
                        <button className="btn green_btn" onClick={handleUpdate}>Spara ändringar</button>
                        <button className="btn cancel_btn" onClick={() => setIsEditing(false)}>Avbryt</button>
                    </>
                ) : (
                    <>
                        <p><strong>Namn:</strong> {apiary.name}</p>
                        <p><strong>Plats:</strong> {apiary.location}</p>
                        <p><strong>Antal kupor:</strong> {apiary.hiveCount}</p>
                        <button onClick={() => setIsEditing(true)} className="btn edit_btn">Redigera</button>
                        <button onClick={handleDelete} className="btn remove_btn">Ta bort</button>
                    </>
                )}
            </div>

            {/* Lista med kupor tillhörande bigården och knapp för att lägga till ny kupa */}
            <div className="apiaryHives">
                <button className="add_btn" onClick={() => setShowHiveModal(true)}>+ Lägg till kupa</button>
                <h2>Kupor</h2>
                {loadingHives ? (
                    <p>Laddar kupor...</p>
                ) : hives.length === 0 ? (
                    <p>Denna bigård har inga registrerade kupor ännu.</p>
                ) : (
                    <ul>
                        {hives.map((hive) => (
                            <li
                                key={hive.id}
                                onClick={() => navigate(`/hive/${hive.id}`)}
                                className="clickable-apiary"
                            >
                                <strong className="hive_title">{hive.name}</strong><br />
                                <strong>Beskrivning:</strong> {hive.description || "–"}

                            </li>
                        ))}
                    </ul>
                )}

                {/* Modal för att lägga till ny kupa */}
                {showHiveModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Ny kupa</h3>
                            <label>Namn:</label>
                            <input
                                type="text"
                                value={newHiveName}
                                onChange={(e) => setNewHiveName(e.target.value)}
                            />

                            <label>Beskrivning (valfri):</label>
                            <textarea
                                value={newHiveDescription}
                                onChange={(e) => setNewHiveDescription(e.target.value)}
                            />
                            <label>Startår:</label>
                            <input
                                type="number"
                                min="1900"
                                max="2100"
                                value={newHiveStartYear}
                                onChange={(e) => setNewHiveStartYear(Number(e.target.value))}
                            />
                            <button className="btn green_btn" onClick={createHive}>Spara</button>
                            <button className="btn cancel_btn" onClick={() => setShowHiveModal(false)}>Avbryt</button>
                        </div>
                    </div>
                )}

            </div>
            {showConfirmModal && (
                <ConfirmDeleteModal
                    message="Är du säker på att du vill ta bort detta objekt?"
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

export default ApiaryDetails;
