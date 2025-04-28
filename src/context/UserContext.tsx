import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import api from "../services/apiService";


type UserContextType = {
    isLoggedIn: boolean;
    isLoading: boolean;  
    login: () => void;
    logout: () => void;
    role: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);
export const UserProvider = ({ children }: { children: ReactNode }) => {

    //states
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    const login = () => setIsLoggedIn(true);
    const logout = () => setIsLoggedIn(false);

    useEffect(() => {
        const checkLogin = async () => {


            try {
                const response = await api.get("/auth/validate"); //pingar backend
                setIsLoggedIn(true); //JWT är giltig
                setRole(response.data.role);//Hämtar rollen från API-svaret
            } catch {
                setIsLoggedIn(false); //Ingen giltig cookie
                setRole(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkLogin();
    }, []);

    return (
        <UserContext.Provider value={{ isLoggedIn, isLoading, login, logout,role }}>
            {children}
        </UserContext.Provider>
    );

};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser måste användas inom UserProvider");
    return context;
};