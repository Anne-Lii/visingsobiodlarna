import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/apiService";

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  publishDate: string;
}

interface NewsContextType {
  news: NewsItem[];
  refreshNews: () => void;
}

const NewsContext = createContext<NewsContextType>({
  news: [],
  refreshNews: () => {},
});

export const useNews = () => useContext(NewsContext);

export const NewsProvider = ({ children }: { children: React.ReactNode }) => {
  const [news, setNews] = useState<NewsItem[]>([]);

  const fetchNews = async () => {
    try {
        console.log("Hämtar nyheter från API...");//DEBUG!!!!!!!!!!!!!!!!!!
      const response = await api.get("/news");
      console.log("Nyheter mottagna från API:", response.data);//DEBUG!!!!!!!!!!!!!!!!!!
      setNews(response.data);
    } catch (error) {
      console.error("Kunde inte hämta nyheter", error);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
  console.log("News state uppdaterad i context:", news);
}, [news]);

  return (
    <NewsContext.Provider value={{ news, refreshNews: fetchNews }}>
      {children}
    </NewsContext.Provider>
  );
};
