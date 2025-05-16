import { useEffect, useState } from "react";
import { fetchDocuments, deleteDocument, getDownloadLink } from "../services/apiService";
import { useToast } from "../components/ToastContext";
import { useUser } from "../context/UserContext";
import "./Documents.scss";


interface Document {
    id: number;
    title: string;
    fileUrl: string;
    category: string;
    uploadDate: string;
}

const AllDocumentsPage = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const { showToast } = useToast();
    const { role } = useUser();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchDocuments();
                setDocuments(res.data);
            } catch {
                showToast("Kunde inte hämta dokument.", "error");
            }
        };
        load();
    }, []);

    const handleOpenDocument = async (id: number, title: string, fileUrl: string) => {
        try {
            const res = await getDownloadLink(id);
            const url = res.data.url;

            const link = document.createElement('a');
            link.href = url;

            //Extrahera filändelsen från url:en
            const extension = fileUrl.split('.').pop() || 'docx';

            //Om title inte redan slutar med extension, lägg till den
            const filename = title.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
                ? title
                : `${title}.${extension}`;

            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch {
            showToast("Kunde inte öppna dokument", "error");
        }
    };


    const handleDelete = async (id: number) => {
        if (!window.confirm("Är du säker på att du vill ta bort dokumentet?")) return;
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter((d) => d.id !== id));
            showToast("Dokument raderat", "success");
        } catch {
            showToast("Misslyckades att ta bort dokumentet", "error");
        }
    };

    const renderTable = (title: string, docs: Document[]) => (
        <>
            <h3>{title}</h3>
            <table>
                <thead>
                    <tr>
                        <th className="title-cell">Titel</th>
                        <th className="date-cell">Datum</th>
                        {role === "admin" && <th className="action-cell"></th>}
                    </tr>
                </thead>
                <tbody>
                    {docs.map((doc) => (
                        <tr key={doc.id}>
                            <td className="title-cell">
                                <button
                                    className="link-button"
                                    onClick={() => handleOpenDocument(doc.id, doc.title, doc.fileUrl)}
                                >
                                    {doc.title}
                                </button>
                            </td>
                            <td className="date-cell">{new Date(doc.uploadDate).toLocaleDateString("sv-SE")}</td>
                            {role === "admin" && (
                                <td className="action-cell">
                                    <button className="btn remove_btn" onClick={() => handleDelete(doc.id)}>Ta bort</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );

    const protocols = documents.filter(d => d.category.toLowerCase() === "protokoll");
    const others = documents.filter(d => d.category.toLowerCase() !== "protokoll");

    return (
        <div className="all-documents-page">
            <h2>Alla dokument</h2>
            {renderTable("Protokoll", protocols)}
            {renderTable("Övriga dokument", others)}
        </div>
    );
};

export default AllDocumentsPage;
