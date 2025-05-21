import React, { useState } from "react";
import { uploadDocument } from "../services/apiService";
import { useToast } from "./ToastContext";

interface Props {
  onClose: () => void;
  onUploaded: () => void;
}

const UploadDocumentModal = ({ onClose, onUploaded }: Props) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Protokoll");
  const [file, setFile] = useState<File | null>(null);

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
      onUploaded();
      onClose();
    } catch {
      showToast("Fel vid uppladdning", "error");
    }
  };

  return (
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
          <button className="btn green_btn" onClick={handleUpload}>Ladda upp</button>
          <button className="btn cancel_btn" onClick={onClose}>Avbryt</button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
