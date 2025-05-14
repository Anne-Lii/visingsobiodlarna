import axios from "axios";
import { useEffect, useState } from "react";
import '../pages/News.scss'
import { useUser } from "../context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import NewsModal from "../components/NewsModal";
import { useToast } from "../components/ToastContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

interface NewsItem {
  Id: number;
  Title: string;
  Content: string;
  PublishDate: string;
}

const News = () => {

  //states
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [showAddNewsForm, setShowAddNewsForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const { showToast } = useToast();
  const { role } = useUser();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get<NewsItem[]>(
          `${process.env.REACT_APP_API_BASE_URL}/news`,
          { withCredentials: true }
        );
        setNewsList(response.data);
      } catch (err) {
        console.error("Kunde inte hämta nyheter", err);
        setError("Kunde inte ladda nyheter just nu.");
      }
    };

    fetchNews(); //Körs direkt vid mount

    //Lyssnar på 'newsUpdated' och hämtar nyheter igen
    const handleNewsUpdated = () => {
      fetchNews();
    };

    window.addEventListener("newsUpdated", handleNewsUpdated);

    return () => {
      window.removeEventListener("newsUpdated", handleNewsUpdated);
    };
  }, []);


  const confirmDelete = async () => {
    if (pendingDeleteId === null) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/news/${pendingDeleteId}`,
        { withCredentials: true }
      );
      setNewsList(prevList => prevList.filter(news => news.Id !== pendingDeleteId));
      window.dispatchEvent(new Event("newsUpdated"));
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
      const existingNews = newsList.find(news => news.Id === id);
      if (!existingNews) return;

      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/news/${id}`,
        {
          id: id,
          title: editedTitle,
          content: editedContent,
          publishDate: existingNews.PublishDate
        },
        { withCredentials: true }
      );

      setNewsList(prevList =>
        prevList.map(news =>
          news.Id === id
            ? { ...news, Title: editedTitle, Content: editedContent, PublishDate: existingNews.PublishDate }
            : news
        )
      );
      setEditingId(null);
      window.dispatchEvent(new Event("newsUpdated"));
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

      {error && <p style={{ color: "red" }}>{error}</p>}

      {newsList.length === 0 && !error && <p>Inga nyheter att visa.</p>}

      <ul>
        {newsList.map((news) => (
          <li key={news.Id}>
            <div>
              <strong
                contentEditable={editingId === news.Id}
                suppressContentEditableWarning={true}
                onInput={(e) => setEditedTitle((e.target as HTMLElement).innerText)}
              >
                {news.Title}
              </strong>
              <br />
              <small>{new Date(news.PublishDate).toLocaleDateString()}</small>
              <p
                contentEditable={editingId === news.Id}
                suppressContentEditableWarning={true}
                onInput={(e) => setEditedContent((e.target as HTMLElement).innerText)}
              >
                {news.Content}
              </p>
            </div>

            {role === "admin" && (
              <div className="admin-buttons-news">
                {editingId === news.Id ? (
                  <>
                    <button className="btn green_btn" onClick={() => handleSave(news.Id)}>Spara</button>
                    <button className="btn cancel_btn" onClick={() => setEditingId(null)}>Avbryt</button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn edit_btn"
                      onClick={() => {
                        setEditingId(news.Id);
                        setEditedTitle(news.Title);
                        setEditedContent(news.Content);
                      }}
                    >
                      Redigera
                    </button>

                    <button
                      className="btn remove_btn"
                      onClick={() => {
                        setPendingDeleteId(news.Id);
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
