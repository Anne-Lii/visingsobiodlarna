import axios from "axios";
import { useEffect, useState } from "react";
import '../pages/News.scss'
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

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

  const { role } = useUser();
  const navigate = useNavigate();

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

    fetchNews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Är du säker på att du vill ta bort denna nyhet?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/news/${id}`,
        { withCredentials: true }
      );
      setNewsList(prevList => prevList.filter(news => news.Id !== id));
    } catch (error) {
      console.error("Kunde inte ta bort nyheten", error);
      alert("Kunde inte ta bort nyheten.");
    }
  };



  const handleSave = async (id: number) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/news/${id}`,
        {
          id: id,
          title: editedTitle,
          content: editedContent
        },
        { withCredentials: true }
      );
      setNewsList(prevList => prevList.map(news =>
        news.Id === id ? { ...news, Title: editedTitle, Content: editedContent } : news
      ));
      setEditingId(null); // Avsluta redigeringsläget
    } catch (error) {
      console.error("Kunde inte spara ändringar", error);
      alert("Kunde inte spara ändringar.");
    }
  };


  return (
    <div className="news_container">
      <h1>Nyheter</h1>

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
                    <button onClick={() => handleSave(news.Id)}>Spara</button>
                    <button onClick={() => setEditingId(null)}>Avbryt</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(news.Id);
                        setEditedTitle(news.Title);
                        setEditedContent(news.Content);
                      }}
                    >
                      Redigera
                    </button>
                    <button onClick={() => handleDelete(news.Id)}>Ta bort</button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>


    </div>
  )
}

export default News
