import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


const CreateNews = () => {

    //states
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //anropar API
        try {
            await axios.post(
              `${process.env.REACT_APP_API_BASE_URL}/news`,
              { title, content },
              { withCredentials: true } //skickar med JWT-cookie
            );
            navigate("/news"); //tillbaka till nyhetslistan
          } catch (error) {
            console.error("Kunde inte publicera nyheten", error);
            
          }

    };

    return (
        <div>
            <h1>Skapa ny nyhet</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Rubrik:</label>
                    <input
                        type="text"
                        id="news_title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <label htmlFor="title">Innehåll:</label>
                    <textarea
                        id="news_content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <button type="submit">Publicera</button>
            </form>
        </div>
    )
}

export default CreateNews
