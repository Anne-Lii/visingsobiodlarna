import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/apiService";

interface Apiary {
  id: number;
  name: string;
  location: string;
  hiveCount: number;
}

const ApiaryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [apiary, setApiary] = useState<Apiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedApiary, setEditedApiary] = useState<Apiary | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
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

    fetchApiary();
  }, [id]);

  const handleUpdate = async () => {
    if (!editedApiary) return;
    try {
      await api.put(`/apiary/${editedApiary.id}`, {
        name: editedApiary.name,
        location: editedApiary.location,
      });
      setApiary(editedApiary);
      setIsEditing(false);
      setSuccessMessage("Bigården har uppdaterats.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Kunde inte uppdatera bigård", error);
    }
  };

  const handleDelete = async () => {
    if (!apiary) return;
    if (!window.confirm("Är du säker på att du vill ta bort denna bigård?")) return;
    try {
      await api.delete(`/apiary/${apiary.id}`);
      navigate("/mypage");
    } catch (error) {
      console.error("Kunde inte radera bigård", error);
    }
  };

  if (loading) return <p>Laddar bigård...</p>;
  if (!apiary) return <p>Bigården kunde inte hittas.</p>;

  return (
    <div className="apiary-details">
        <Link to="/mypage" className="back-link">← Tillbaka till Mina sidor</Link>
      <h2>Bigårdsdetaljer</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}

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
          <button onClick={handleUpdate}>Spara ändringar</button>
          <button onClick={() => setIsEditing(false)}>Avbryt</button>
        </>
      ) : (
        <>
          <p><strong>Namn:</strong> {apiary.name}</p>
          <p><strong>Plats:</strong> {apiary.location}</p>
          <p><strong>Antal kupor:</strong> {apiary.hiveCount}</p>
          <button onClick={() => setIsEditing(true)}>Redigera</button>
          <button onClick={handleDelete}>Ta bort</button>
        </>
      )}
    </div>
  );
};

export default ApiaryDetails;
