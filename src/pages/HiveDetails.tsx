import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/apiService";
import { useEffect, useState } from "react";
import '../pages/HiveDetails.scss';
import { useToast } from "../components/ToastContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

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
    const [editableHive, setEditableHive] = useState<{
        name: string;
        description: string;
        startYear: number;
    }>({
        name: "",
        description: "",
        startYear: currentYear
    });
    const [isEditingHive, setIsEditingHive] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHive = async () => {
            try {
                const response = await api.get(`/hive/${id}`);
                setHive(response.data);
            } catch (error) {
                console.error("Kunde inte hämta kupa", error);
                showToast("Kunde inte hämta kupa", "error");
            }
        };
        fetchHive();
    }, [id]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get(`/mites/by-hive/${id}`);
                const data: MiteReport[] = response.data;

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
                showToast("Kunde inte hämta rapporter", "error");
            }
        };
        fetchReports();
    }, [id]);

    useEffect(() => {
        if (hive) {
            setEditableHive({
                name: hive.name,
                description: hive.description || "",
                startYear: hive.startYear
            });
        }
    }, [hive]);

    const filteredReports = reports.filter((r) => r.year === selectedYear);

    //uppdatera kupa
    const handleUpdateHive = async () => {
        if (!hive) return;
        try {
            await api.put(`/hive/${hive.id}`, {
                name: editableHive.name,
                description: editableHive.description,
                apiaryId: hive.apiaryId,
                startYear: editableHive.startYear
            });
            const response = await api.get(`/hive/${id}`);
            setHive(response.data);
            setIsEditingHive(false);
            showToast("Kupan har uppdaterats!", "success");
        } catch (error) {
            console.error("Kunde inte uppdatera kupa", error);
            showToast("Kunde inte uppdatera kupa", "error");
        }
    };

    //ta bort kupa
    const handleDeleteHive = () => {
        if (!hive) return;
        setPendingDeleteId(hive.id);
        setShowConfirmModal(true);
    };

    const confirmDeleteHive = async () => {
        if (!pendingDeleteId || !hive) return;

        try {
            await api.delete(`/hive/${pendingDeleteId}`);
            showToast("Kupan har tagits bort.", "success");
            navigate(`/apiary/${hive.apiaryId}`, { state: { refresh: true } });
        } catch (error) {
            console.error("Kunde inte ta bort kupa", error);
            showToast("Något gick fel. Kupan kunde inte tas bort.", "error");
        } finally {
            setShowConfirmModal(false);
            setPendingDeleteId(null);
        }
    };

    //kvalsterrapporter
    const handleSaveReports = async () => {

        if (!selectedYear || !id) return;

        try {
            const savePromises = Object.entries(editedReports).map(async ([weekStr, miteCount]) => {
                const week = Number(weekStr);
                const existing = filteredReports.find((r) => r.week === week);

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
                } else {
                    try {
                        const response = await api.post(`/mites`, {
                            hiveId: Number(id),
                            year: selectedYear,
                            week,
                            miteCount
                        });
                    } catch (err) {
                        console.error("Kunde inte skapa rapport för vecka", week, err);
                        showToast("Kunde inte skapa rapport för vecka", "error");
                    }

                }
            });

            await Promise.all(savePromises);
            setIsEditing(false);
            setEditedReports({});
            //Uppdaterar listan
            const response = await api.get(`/mites/by-hive/${id}`);
            setReports(response.data);
            showToast("Rapporter sparade", "success");
        } catch (error) {
            console.error("Kunde inte spara rapporter", error);
            showToast("Kunde inte spara rapporter", "error");
        }
    };

    return (
        <div className="hive_container">
            <button onClick={() => navigate(-1)} className="back-link">← Tillbaka</button>

            <div className="hive-details">
                {!isEditingHive ? (
                    <>
                        <h1>{editableHive.name}</h1>
                        <p><strong>Startår:</strong> {editableHive.startYear}</p>
                        <p><strong>Beskrivning:</strong> {editableHive.description || "–"}</p>
                        <button className="btn edit_btn" onClick={() => setIsEditingHive(true)}>Redigera kupa</button>
                        <button className="btn cancel_btn" onClick={handleDeleteHive}>Ta bort</button>
                    </>
                ) : (
                    <>
                        <label>Namn:</label>
                        <input
                            type="text"
                            value={editableHive.name}
                            onChange={(e) => setEditableHive({ ...editableHive, name: e.target.value })}
                        />

                        <label>Beskrivning:</label>
                        <textarea
                            value={editableHive.description}
                            onChange={(e) => setEditableHive({ ...editableHive, description: e.target.value })}
                        />

                        <label>Startår:</label>
                        <input
                            type="number"
                            min="1900"
                            max="2100"
                            value={editableHive.startYear}
                            onChange={(e) => setEditableHive({ ...editableHive, startYear: Number(e.target.value) })}
                        />

                        <button className="btn green_btn" onClick={handleUpdateHive}>Spara kupa</button>
                        <button
                            className="btn cancel_btn"
                            onClick={() => {
                                setIsEditingHive(false);
                                if (hive) {
                                    setEditableHive({
                                        name: hive.name,
                                        description: hive.description || "",
                                        startYear: hive.startYear
                                    });
                                }
                            }}
                        >
                            Avbryt
                        </button>
                    </>
                )}
            </div>

            <div className="report-section">
                <h2>Kvalsterrapportering</h2>

                <label>Välj år: </label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <div style={{ marginTop: "1rem" }}>
                    {!isEditing ? (
                        <button className="btn green_btn" onClick={() => setIsEditing(true)}>Rapportera kvalster</button>
                    ) : (
                        <>
                            <button className="btn green_btn" onClick={handleSaveReports}>Spara</button>
                            <button className="btn cancel_btn" onClick={() => {
                                setIsEditing(false);
                                setEditedReports({});
                            }}>Avbryt</button>
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
                        {Array.from({ length: 52 }, (_, i) => i + 1).map(week => {
                            const report = filteredReports.find(r => r.week === week);
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
                                                    setEditedReports(prev => ({
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

            {showConfirmModal && (
                <ConfirmDeleteModal
                    message="Är du säker på att du vill ta bort denna kupa?"
                    onConfirm={confirmDeleteHive}
                    onCancel={() => {
                        setShowConfirmModal(false);
                        setPendingDeleteId(null);
                    }}
                />
            )}
        </div>
    );

};

export default HiveDetails;