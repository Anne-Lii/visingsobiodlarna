import axios from "axios";
import { useEffect, useState } from "react";
import '../pages/News.scss'
import { useUser } from "../context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import NewsModal from "../components/NewsModal";
import { useToast } from "../components/ToastContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { useNews } from "../context/NewsContext";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  publishDate: string;
}

const News = () => {

  //states
  const { news, refreshNews } = useNews();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [showAddNewsForm, setShowAddNewsForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const { showToast } = useToast();
  const { role } = useUser();

  const confirmDelete = async () => {
    if (pendingDeleteId === null) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/news/${pendingDeleteId}`,
        { withCredentials: true }
      );
      refreshNews();
      showToast("Nyheten borttagen!", "success");
    } catch (error) {
      console.error("Kunde inte ta bort nyheten", error);
      showToast("Kunde inte ta bort nyheten.", "error");
    } finally {
      setShowConfirmModal(false);
      setPendingDeleteId(null);
    }
  };

  const handleSave = async (id: number) => {
    try {
      const existingNews = news.find(news => news.id === id);
      if (!existingNews) return;

      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/news/${id}`,
        {
          id: id,
          title: editedTitle,
          content: editedContent,
          publishDate: existingNews.publishDate
        },
        { withCredentials: true }
      );
      refreshNews();
      setEditingId(null);
      showToast("Ändringar sparade!.", "success");
    } catch (error) {
      console.error("Kunde inte spara ändringar", error);
      showToast("Kunde inte spara ändringar.", "error");
    }
  };



  return (
    <div className="news_container">
      <h1>Nyheter</h1>

      {role === "admin" && (
        <div className="add-news-btn">
          <button className="add_btn" onClick={() => setShowAddNewsForm(true)}>
            + Lägg till nyhet
          </button>
        </div>
      )}

      {news.length === 0 && <p>Inga nyheter att visa.</p>}

      <ul>
        {news.map((news) => (
          <li key={news.id}>
            <div>
              <strong
                contentEditable={editingId === news.id}
                suppressContentEditableWarning={true}
                tabIndex={editingId === news.id ? 0 : -1}
                onInput={(e) => setEditedTitle((e.target as HTMLElement).innerText)}
              >
                {news.title}
              </strong>

              <small>{new Date(news.publishDate).toLocaleDateString("sv-SE")}</small>

              <p
                contentEditable={editingId === news.id}
                suppressContentEditableWarning={true}
                tabIndex={editingId === news.id ? 0 : -1}
                onInput={(e) => setEditedContent((e.target as HTMLElement).innerText)}
              >
                {news.content}
              </p>

            </div>

            {role === "admin" && (
              <div className="admin-buttons-news">
                {editingId === news.id ? (
                  <>
                    <button className="btn green_btn" onClick={() => handleSave(news.id)}>Spara</button>
                    <button className="btn cancel_btn" onClick={() => setEditingId(null)}>Avbryt</button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn edit_btn"
                      onClick={() => {
                        setEditingId(news.id);
                        setEditedTitle(news.title);
                        setEditedContent(news.content);
                      }}
                    >
                      Redigera
                    </button>

                    <button
                      className="btn remove_btn"
                      onClick={() => {
                        setPendingDeleteId(news.id);
                        setShowConfirmModal(true);
                      }}
                    >
                      Ta bort
                      <FontAwesomeIcon icon={faTrash} size="lg" />
                    </button>
                  </>
                )}
              </div>

            )}
          </li>
        ))}
      </ul>
      {showAddNewsForm && <NewsModal onClose={() => setShowAddNewsForm(false)} />}

      {showConfirmModal && (
        <ConfirmDeleteModal
          message="Är du säker på att du vill ta bort denna nyhet?"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmModal(false);
            setPendingDeleteId(null);
          }}
        />
      )}
    </div>
  )
}

export default News
