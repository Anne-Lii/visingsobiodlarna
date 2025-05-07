import { useParams } from "react-router-dom";
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
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const uniqueYears = Array.from(new Set(reports.map((r) => r.year)));

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
            setReports(response.data);
      
            const yearList = response.data.map((r: MiteReport) => r.year);
            const unique: number[] = Array.from(new Set(yearList));
            if (unique.length > 0) setSelectedYear(unique[0]);
          } catch (error) {
            console.error("Kunde inte hämta rapporter", error);
          }
        };
        fetchReports();
      }, [id]);


    const filteredReports = reports.filter((r) => r.year === selectedYear);
    const weeksWithData = filteredReports.map((r) => r.week);

    const fetchMiteReports = async (hiveId: number) => {
        const response = await api.get(`/mites/by-hive/${hiveId}`);
        return response.data; // [{ year: 2023, week: 12, miteCount: 5 }, ...]
    };

    return (
        <div>
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
          <td>{report ? report.miteCount : "–"}</td>
        </tr>
      );
    })}
  </tbody>
</table>
        </div>
    );
};

export default HiveDetails;