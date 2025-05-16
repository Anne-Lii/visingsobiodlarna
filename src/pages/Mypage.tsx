import { useEffect, useState } from "react";
import api from "../services/apiService";
import '../pages/MyPage.scss'
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastContext";

interface Apiary {
  id: number;
  name: string;
  location: string;
  hiveCount: number;
}

interface Hive {
  id: number;
  name: string;
  description?: string;
  apiaryId: number;
  startYear: number;
}

//Plocka ut nuvarande veckonummer
const getCurrentWeek = () => {
  const date = new Date();
  //Torsdag i den här veckan används för att säkerställa korrekt vecka
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
};


const Mypage = () => {

  //states
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newApiary, setNewApiary] = useState({ name: "", location: "" });
  const [showMiteModal, setShowMiteModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState<number>(getCurrentWeek());
  const [selectedApiaryId, setSelectedApiaryId] = useState<number | null>(null);
  const [hives, setHives] = useState<Hive[]>([]);
  const [miteCounts, setMiteCounts] = useState<{ [hiveId: number]: number | undefined }>({});
  const [processedHives, setProcessedHives] = useState<number[]>([]);
  const [currentHiveIndex, setCurrentHiveIndex] = useState(0);
  const [shouldResumeSaving, setShouldResumeSaving] = useState(false);
  const [overwriteModal, setOverwriteModal] = useState<{
    hive: Hive | null;
    miteCount: number;
  } | null>(null);

  //states honungsskörd
  const [showHoneyModal, setShowHoneyModal] = useState(false);
  const [harvestDate, setHarvestDate] = useState<string>(""); //Datum för skörd t.ex. "2025-05-15"
  const [harvestKg, setHarvestKg] = useState<string>(""); //sträng för att tillåta kommatecken


  const { showToast } = useToast();
  const navigate = useNavigate();


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

  useEffect(() => {
    if (shouldResumeSaving && !overwriteModal) {
      setShouldResumeSaving(false);
      handleSaveMiteReports();
    }
  }, [shouldResumeSaving, overwriteModal]);


  //Spara bigård
  const handleSaveApiary = async () => {
    try {
      await api.post("/apiary", newApiary);
      setShowModal(false);
      setNewApiary({ name: "", location: "" });

      //Uppdaterar listan
      const response = await api.get("/apiary/my");
      setApiaries(response.data);
      showToast("Bigården har sparats!", "success");

    } catch (error) {
      console.error("Kunde inte spara bigård", error);
      showToast("Kunde inte spara bigård", "error");
    }
  };

  //spara kvalsterrapport
  const handleSaveMiteReports = async () => {
    if (!selectedApiaryId || hives.length === 0) return;

    for (let i = currentHiveIndex; i < hives.length; i++) {
      const hive = hives[i];
      if (processedHives.includes(hive.id)) continue;

      const count = miteCounts[hive.id];
      if (count == null) continue;

      try {
        const existing = await api.get(`/mites/by-hive/${hive.id}`);
        const alreadyExists = existing.data.some(
          (r: any) => r.year === selectedYear && r.week === selectedWeek
        );

        if (alreadyExists) {
          setOverwriteModal({ hive, miteCount: count });
          setCurrentHiveIndex(i); //Spara vart användaren pausade
          return;
        }

        await api.post("/mites", {
          hiveId: hive.id,
          year: selectedYear,
          week: selectedWeek,
          miteCount: count,
        });

        setProcessedHives((prev) => [...prev, hive.id]);

      } catch (error) {
        console.error("Fel vid sparning", error);
        showToast("Fel vid sparning", "error");
      }
    }

    finishSaving();
  };

  //fortsätter spara rapport efter val om överskrivning eller ej
  const finishSaving = () => {
    showToast("Rapporter sparade", "success");
    setShowMiteModal(false);
    setSelectedApiaryId(null);
    setHives([]);
    setMiteCounts({});
    setProcessedHives([]);
  };

  //användaren väljer att skriva över antalet kvalster som redan finns rapporterade den veckan
  const confirmOverwrite = async () => {
    if (!overwriteModal?.hive) return;

    try {
      const { hive, miteCount } = overwriteModal;
      await api.put("/mites", {
        hiveId: hive.id,
        year: selectedYear,
        week: selectedWeek,
        miteCount
      });

      setProcessedHives((prev) => [...prev, hive.id]);
      setCurrentHiveIndex((prev) => prev + 1);
      setOverwriteModal(null);
      setShouldResumeSaving(true);
    } catch (error) {
      console.error("Kunde inte skriva över", error);
      showToast("Kunde inte skriva över rapport", "error");
      setOverwriteModal(null);
    }
  };

  //användaren väljer INTE att skriva över antalet kvalster som redan finns rapporterade den veckan
  const cancelOverwrite = () => {
    const hive = overwriteModal?.hive;
    if (hive) {
      setProcessedHives((prev) => [...prev, hive.id]);
      setCurrentHiveIndex((prev) => prev + 1);
    }
    setOverwriteModal(null);
    setShouldResumeSaving(true);
  };

  //funktion för att skapa batchnummer
  const generateBatchId = (year: number, existingBatches: string[]): string => {

    //Räknar antal registreringar för året + 1 och formatera som 3-siffrigt löpnummer
    const countThisYear = existingBatches.filter(b => b?.trim().startsWith(year.toString())).length;
    const batchNumber = (countThisYear + 1).toString().padStart(3, "0");
    return `${year}:${batchNumber}`;
  };

  const handleSaveHarvest = async () => {
  if (!harvestDate || !harvestKg) {
    showToast("Vänligen ange både datum och vikt.", "error");
    return;
  }

  // Konvertera kilo till nummer och hantera kommatecken som decimalpunkt
  const kilos = Number(harvestKg.replace(",", "."));
  if (isNaN(kilos) || kilos <= 0) {
    showToast("Ange ett giltigt antal kilo.", "error");
    return;
  }

  try {
    // Hämta befintliga batchar för året från backend (exempel)
    const year = new Date(harvestDate).getFullYear();
    const response = await api.get(`/honeyharvest?year=${year}`); // backend-endpoint behöver finnas
    const existingBatches = response.data.map((h: any) => h.batchId); // anta att batchId finns i svar

    const batchId = generateBatchId(year, existingBatches);

    // Skicka POST-anrop till backend med skörden
    await api.post("/honeyharvest", {
      harvestDate,
      amountKg: kilos,
      year,
      isTotalForYear: false
    });

    showToast("Honungsskörden sparades!", "success");
    setShowHoneyModal(false);
    setHarvestDate("");
    setHarvestKg("");
    // Eventuellt hämta om listor eller uppdatera state här
  } catch (error) {
    console.error("Kunde inte spara honungsskörd", error);
    showToast("Kunde inte spara honungsskörd", "error");
  }
};



  return (
    <div className="mypage-container">
      <h1>Mina sidor</h1>
      <button className="add_btn" onClick={() => setShowMiteModal(true)}>+ Rapportera kvalster</button>
      <button className="add_btn" onClick={() => setShowHoneyModal(true)}>+ Honungsskörd</button>
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
              <li key={apiary.id} onClick={() => navigate(`/apiary/${apiary.id}`)} className="clickable-apiary">
                <strong>{apiary.name}</strong><br />
                Plats: {apiary.location}<br />
                <p>Antal kupor: {apiary.hiveCount}</p>
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

      {/* Modal för att rapportera kvalster från Mina sidor */}
      {showMiteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Rapportera kvalster</h2>

            <label>Välj år:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>

            <label>Välj vecka:</label>
            <select value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))}>
              {Array.from({ length: 52 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Vecka {i + 1}</option>
              ))}
            </select>

            <label>Välj bigård:</label>
            <select
              value={selectedApiaryId ?? ""}
              onChange={async (e) => {
                const id = Number(e.target.value);
                setSelectedApiaryId(id);
                const response = await api.get(`/hive/by-apiary/${id}`);
                setHives(response.data);
                setMiteCounts({});
              }}
            >
              <option value="">-- Välj --</option>
              {apiaries.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            {selectedApiaryId && (
              <div className="mite-table">
                <table>
                  <thead>
                    <tr>
                      <th>Kupa</th>
                      <th>Antal kvalster (v{selectedWeek})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hives.map((hive) => (
                      <tr key={hive.id}>
                        <td>{hive.name}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={miteCounts[hive.id] ?? ""}
                            onChange={(e) =>
                              setMiteCounts((prev) => ({
                                ...prev,
                                [hive.id]: e.target.value === "" ? undefined : Number(e.target.value),
                              }))
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={handleSaveMiteReports}>Spara</button>
              <button className="cancel_btn" onClick={() => {
                setShowMiteModal(false);
                setSelectedApiaryId(null);
                setHives([]);
                setMiteCounts({});
              }}>Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal som visas vid rapportering av kvalster om det redan finns kvalster rapporterat den veckan */}
      {overwriteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Bekräfta överskrivning</h2>
            <p>
              Det finns redan en kvalsterrapport för <strong>{overwriteModal.hive?.name}</strong> vecka {selectedWeek}.
            </p>
            <p>Vill du skriva över den med det nya värdet: <strong>{overwriteModal.miteCount}</strong>?</p>
            <button onClick={confirmOverwrite}>OK</button>
            <button className="cancel_btn" onClick={cancelOverwrite}>Avbryt</button>
          </div>
        </div>
      )}

      {showHoneyModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Registrera honungsskörd</h2>

            <label>Datum för skörd:</label>
            <input
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              required
            />

            <label>Antal kilo (t.ex. 23,5):</label>
            <input
              type="text"
              value={harvestKg}
              onChange={(e) => setHarvestKg(e.target.value)}
              pattern="^\d+([,\.]\d+)?$" //regex för siffra med valfritt decimaltecken , eller .
              title="Ange ett tal, t.ex. 23,5"
              required
            />

            <div className="modal-actions">
              <button onClick={handleSaveHarvest}>Spara</button>
              <button className="cancel_btn" onClick={() => setShowHoneyModal(false)}>Avbryt</button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

export default Mypage
