import { useEffect, useState } from "react";
import { fetchDocuments, uploadDocument, deleteDocument, getDownloadLink } from "../services/apiService";
import { useToast } from "./ToastContext";
import './DocumentSection.scss';


interface Document {
    id: number;
    title: string;
    fileUrl: string;
    category: string;
    uploadDate: string;
}

const DocumentsSection = ({ isAdmin }: { isAdmin: boolean }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Protokoll");
    const [file, setFile] = useState<File | null>(null);
    const [selectedProtocolId, setSelectedProtocolId] = useState("");
    const [selectedOtherId, setSelectedOtherId] = useState("");
    const { showToast } = useToast();

    const loadDocuments = async () => {
        try {
            const res = await fetchDocuments();
            setDocuments(res.data);
        } catch (err) {
            showToast("Kunde inte hämta dokument.", "error");
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const handleUpload = async () => {
        if (!file || !title) {
            showToast("Vänligen fyll i alla fält", "error");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("category", category);

        try {
            await uploadDocument(formData);
            showToast("Dokumentet laddades upp!", "success");
            setShowUploadModal(false);
            setTitle("");
            setCategory("Protokoll");
            setFile(null);
            loadDocuments();
        } catch (err) {
            showToast("Fel vid uppladdning", "error");
        }
    };

    const handleSelect = async (
        id: number,
        setSelected: React.Dispatch<React.SetStateAction<string>>
    ) => {
        try {
            const res = await getDownloadLink(id);
            window.open(res.data.url, "_blank");
        } catch {
            showToast("Kunde inte öppna dokument", "error");
        } finally {
            setSelected(""); //Återställ select till default
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Är du säker på att du vill ta bort dokumentet?")) return;
        try {
            await deleteDocument(id);
            showToast("Dokument borttaget", "success");
            loadDocuments();
        } catch {
            showToast("Kunde inte ta bort dokumentet", "error");
        }
    };

    const protocolDocs = documents.filter((d) => d.category.toLowerCase() === "protokoll");
    const otherDocs = documents.filter((d) => d.category.toLowerCase() !== "protokoll");

    return (
        <section className="documents-section">
            <h2>Dokument</h2>


            <select
                value={selectedProtocolId}
                onChange={(e) => handleSelect(Number(e.target.value), setSelectedProtocolId)}
            >
                <option disabled value="">Protokoll</option>
                {protocolDocs.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                        {doc.title} ({new Date(doc.uploadDate).toLocaleDateString("sv-SE")})
                    </option>
                ))}
            </select>


            <select
                value={selectedOtherId}
                onChange={(e) => handleSelect(Number(e.target.value), setSelectedOtherId)}
            >
                <option disabled value="">Övriga dokument</option>
                {otherDocs.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                        {doc.title} ({new Date(doc.uploadDate).toLocaleDateString("sv-SE")})
                    </option>
                ))}
            </select>

            {isAdmin && (
                <>
                    <button onClick={() => setShowUploadModal(true)}>+ Lägg till dokument</button>

                    {showUploadModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>Ladda upp dokument</h2>
                                <label>Titel:</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

                                <label>Kategori:</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value="Protokoll">Protokoll</option>
                                    <option value="Övrigt">Övrigt</option>
                                </select>

                                <label>Välj fil:</label>
                                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

                                <div className="modal-actions">
                                    <button onClick={handleUpload}>Ladda upp</button>
                                    <button className="cancel_btn" onClick={() => setShowUploadModal(false)}>Avbryt</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <p>
                <a href="/dokument" className="all-documents-link">Alla dokument</a>
            </p>
        </section>
    );
};

export default DocumentsSection;
