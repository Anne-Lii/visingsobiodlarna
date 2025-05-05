import { useEffect, useState } from "react";
import api from "../services/apiService";
import '../pages/MyPage.scss'
import { Console } from "console";

interface Apiary {
  id: number;
  name: string;
  location: string;
}

const Mypage = () => {

  //states
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newApiary, setNewApiary] = useState({ name: "", location: "" });
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
    <div>
      <h1>Mina sidor</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <button onClick={() => setShowModal(true)}>+ Lägg till bigård</button>
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
              <strong>{apiary.name}</strong><br />
              Plats: {apiary.location}
              <button onClick={() => handleDeleteApiary(apiary.id)}>Ta bort</button>
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
