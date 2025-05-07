import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/apiService";
import { useEffect, useState } from "react";
import '../pages/HiveDetails.scss';

interface Hive {
    id: number;
    name: string;
    description?: string;
    startYear: number;
    startMonth: number;
    apiaryId: number;
}

interface MiteReport {
    id: number;
    year: number;
    week: number;
    miteCount: number;
}

const HiveDetails = () => {
    const { id } = useParams();
    const [hive, setHive] = useState<Hive | null>(null);
    const [reports, setReports] = useState<MiteReport[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const currentYear = new Date().getFullYear();
    const uniqueYears = Array.from(new Set([...reports.map((r) => r.year), currentYear])).sort((a, b) => b - a);
    const [editedReports, setEditedReports] = useState<{ [week: number]: number | undefined }>({});

    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHive = async () => {
            try {
                const response = await api.get(`/hive/${id}`);
                setHive(response.data);
            } catch (error) {
                console.error("Kunde inte hämta kupa", error);
            }
        };
        fetchHive();
    }, [id]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get(`/mites/by-hive/${id}`);
                const data: MiteReport[] = response.data;
                console.log("Rapporter från backend:", response.data);
                setReports(data);

                const yearList = data.map((r) => r.year);
                const unique: number[] = Array.from(new Set(yearList));

                if (unique.length > 0) {
                    setSelectedYear(unique[0]);
                } else {
                    // Om inga rapporter finns: välj aktuellt år som default
                    setSelectedYear(new Date().getFullYear());
                }
            } catch (error) {
                console.error("Kunde inte hämta rapporter", error);
            }
        };
        fetchReports();
    }, [id]);

    const filteredReports = reports.filter((r) => r.year === selectedYear);

    const handleSaveReports = async () => {
        console.log("Sparar ändringar:", editedReports);//DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        if (!selectedYear || !id) return;
        console.log("Valt år:", selectedYear, "Kupa-ID:", id);//DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        try {
            const savePromises = Object.entries(editedReports).map(async ([weekStr, miteCount]) => {
                const week = Number(weekStr);
                const existing = filteredReports.find((r) => r.week === week);

                console.log("Vecka:", week, "MiteCount:", miteCount, "Existing:", existing);//DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                if (miteCount == null) return;

                if (existing) {
                    if (!existing.id) {
                        console.warn("Saknar ID för befintlig rapport:", existing);
                        return;
                    }

                    const response = await api.put(`/mites/${existing.id}`, {
                        hiveId: Number(id),
                        year: selectedYear,
                        week,
                        miteCount
                    });
                    console.log("Rapport uppdaterad:", response.status, response.data);//DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                } else {
                    console.log("Skapar ny rapport för vecka", week);//DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    try {
                        const response = await api.post(`/mites`, {
                            hiveId: Number(id),
                            year: selectedYear,
                            week,
                            miteCount
                        });
                        console.log("Rapport skapad:", response.status, response.data);//DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    } catch (err) {
                        console.error("Kunde inte skapa rapport för vecka", week, err);
                    }

                }
            });

            await Promise.all(savePromises);
            setIsEditing(false);
            setEditedReports({});
            //Uppdaterar listan
            const response = await api.get(`/mites/by-hive/${id}`);
            setReports(response.data);
        } catch (error) {
            console.error("Kunde inte spara rapporter", error);
        }
    };


    return (
        <div>
            <button onClick={() => navigate(-1)} className="back-link">← Tillbaka</button>
            <h1>{hive?.name}</h1>
            <p><strong>Beskrivning:</strong> {hive?.description || "–"}</p>
            <p><strong>Startdatum:</strong> {hive ? `${hive.startYear}-${String(hive.startMonth).padStart(2, "0")}` : "–"}</p>

            <h2>Kvalsterrapportering</h2>
            <label>Välj år: </label>
            <select onChange={(e) => setSelectedYear(Number(e.target.value))} value={selectedYear || ""}>
                {uniqueYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>

            <div style={{ marginTop: "1rem" }}>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)}>Rapportera kvalster</button>
                ) : (
                    <>
                        <button onClick={() => {
                            console.log("Spara klickat");
                            handleSaveReports();
                        }}>Spara</button>
                        <button onClick={() => { setIsEditing(false); setEditedReports({}); }}>Avbryt</button>
                    </>
                )}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Vecka</th>
                        <th>Antal kvalster</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => {

                        const report = filteredReports.find((r) => r.week === week);

                        return (
                            <tr key={week}>
                                <td>Vecka {week}</td>
                                <td>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="0"
                                            value={editedReports[week] ?? report?.miteCount ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                console.log("🔢 Vecka", week, "nytt värde:", value); //DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                                                setEditedReports((prev) => ({
                                                    ...prev,
                                                    [week]: value === "" ? undefined : Number(value)
                                                }));
                                            }}
                                        />
                                    ) : (
                                        report ? report.miteCount : "–"
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

        </div>
    );
};

export default HiveDetails;