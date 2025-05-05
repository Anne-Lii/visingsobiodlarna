import { useEffect, useState } from "react";
import api from "../services/apiService";
import '../pages/MyPage.scss'
import { Console } from "console";

interface Apiary {
  id: number;
  name: string;
  location: string;
  hiveCount: number;
}

const Mypage = () => {

  //states
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newApiary, setNewApiary] = useState({ name: "", location: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedApiary, setEditedApiary] = useState<Apiary>({ id: 0, name: "", location: "", hiveCount: 0 });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiaries = async () => {
      try {
        const response = await api.get("/apiary/my");
        setApiaries(response.data);
      } catch (error) {
        console.error("Kunde inte hämta bigårdar", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApiaries();
  }, []);


  const handleSaveApiary = async () => {
    try {
      await api.post("/apiary", newApiary);
      setShowModal(false);
      setNewApiary({ name: "", location: "" });

      //Uppdaterar listan
      const response = await api.get("/apiary/my");
      setApiaries(response.data);
      console.log("Hämtade bigårdar:", response.data);//DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

      setSuccessMessage("Bigården har sparats!");
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error("Kunde inte spara bigård", error);
    }
  };

  //uppdatera en bigård
  const handleUpdateApiary = async () => {
    try {
      await api.put(`/apiary/${editedApiary.id}`, {
        name: editedApiary.name,
        location: editedApiary.location,
      });
      setEditingId(null);
      const response = await api.get("/apiary/my");
      setApiaries(response.data);
      setSuccessMessage("Bigården har uppdaterats.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Kunde inte uppdatera bigård", error);
    }
  };

  //radera en bigård
  const handleDeleteApiary = async (id: number) => {
    if (!window.confirm("Är du säker på att du vill ta bort denna bigård?")) return;

    try {
      await api.delete(`/apiary/${id}`);
      setApiaries(apiaries.filter((a) => a.id !== id));
      setSuccessMessage("Bigården har raderats.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Kunde inte radera bigård", error);
    }
  };

  return (
    <div className="mypage-container">
      <h1>Mina sidor</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <button className="add_btn" >+ Rapportera kvalster</button>
      <button className="add_btn" onClick={() => setShowModal(true)}>+ Lägg till bigård</button>
      
      <div className="my_apiaries">
        <h2>Mina bigårdar</h2>
        {loading ? (
          <p>Laddar bigårdar...</p>
        ) : apiaries.length === 0 ? (
          <p>Du har inga registrerade bigårdar ännu.</p>
        ) : (
          <ul>
            {apiaries.map((apiary) => (
              <li key={apiary.id}>
                {editingId === apiary.id ? (
                  <>
                    <input
                      value={editedApiary.name}
                      onChange={(e) => setEditedApiary({ ...editedApiary, name: e.target.value })}
                    /><br />
                    <input
                      value={editedApiary.location}
                      onChange={(e) => setEditedApiary({ ...editedApiary, location: e.target.value })}
                    /><br />
                    <button onClick={handleUpdateApiary}>Spara</button>
                    <button onClick={() => setEditingId(null)}>Avbryt</button>
                  </>
                ) : (
                  <>
                    <strong>{apiary.name}</strong><br />
                    Plats: {apiary.location}<br />
                    <p>Antal kupor: {apiary.hiveCount}</p>
                    <div className="apiary-buttons">
                      <button onClick={() => {
                        setEditingId(apiary.id);
                        setEditedApiary(apiary);
                      }}>Redigera</button>
                      <button onClick={() => handleDeleteApiary(apiary.id)}>Ta bort</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal för att lägga till ny bigård */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Ny bigård</h2>
            <label>Namn:</label>
            <input
              type="text"
              value={newApiary.name}
              onChange={(e) => setNewApiary({ ...newApiary, name: e.target.value })}
              required
            />
            <label>Plats (valfri beskrivning eller koordinater):</label>
            <input
              type="text"
              value={newApiary.location}
              onChange={(e) => setNewApiary({ ...newApiary, location: e.target.value })}
            />
            <button onClick={handleSaveApiary}>Spara</button>
            <button onClick={() => setShowModal(false)}>Avbryt</button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Mypage
