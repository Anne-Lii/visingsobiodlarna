import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import api from "../services/apiService";


type UserContextType = {
    isLoggedIn: boolean;
    isLoading: boolean;  
    login: () => void;
    logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);
export const UserProvider = ({ children }: { children: ReactNode }) => {

    //states
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const login = () => setIsLoggedIn(true);
    const logout = () => setIsLoggedIn(false);

    useEffect(() => {
        const checkLogin = async () => {
            console.log("🔄 Validerar inloggning...");//debug!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

            try {
                await api.get("/auth/validate"); //pingar backend
                console.log("✅ Inloggning bekräftad");//debug!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                setIsLoggedIn(true); //JWT är giltig
            } catch {
                console.log("❌ Inte inloggad");//debug!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                setIsLoggedIn(false); //Ingen giltig cookie
            } finally {
                setIsLoading(false);
                console.log("🟢 Klar med validering");//debug!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            }
        };

        checkLogin();
    }, []);

    return (
        <UserContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
            {children}
        </UserContext.Provider>
    );

};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser måste användas inom UserProvider");
    return context;
};