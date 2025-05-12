import { useState } from "react";
import api from "../services/apiService";
import { useToast } from "./ToastContext";

interface Props {
  onClose: () => void;
}

const NewsModal = ({ onClose }: Props) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { showToast } = useToast();//Toast-meddelanden

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/news", { title, content });
      showToast("Nyheten publicerades!", "success");
      window.dispatchEvent(new Event("newsUpdated"));
      onClose();
    } catch (error) {
      console.error("Kunde inte publicera nyheten", error);
      showToast("Kunde inte publicera nyheten", "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-news-form">
        <h2>Ny nyhet</h2>
        <form onSubmit={handleSubmit}>
          <label>Titel:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label>Innehåll:</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
          <button className="btn green_btn" type="submit">Publicera nyhet</button>
          <button className="btn cancel_btn" type="button" onClick={onClose}>Avbryt</button>
        </form>
      </div>
    </div>
  );
};

export default NewsModal;
