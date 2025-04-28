import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import api from "../services/apiService";


type UserContextType = {
    isLoggedIn: boolean;
    isLoading: boolean;  
    login: () => void;
    logout: () => void;
    role: string | null;
    validate: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {

    //states
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    const login = () => setIsLoggedIn(true);
    const logout = () => {
        setIsLoggedIn(false);
        setRole(null); //töm rollen vid utloggning 
    };

    const validate = async () => {
        try {
            const response = await api.get("/auth/validate", { withCredentials: true });
            setIsLoggedIn(true);
            setRole(response.data.role);
        } catch {
            setIsLoggedIn(false);
            setRole(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        validate(); // Kör validate första gången
    }, []);

    return (
        <UserContext.Provider value={{ isLoggedIn, isLoading, login, logout, role, validate }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser måste användas inom UserProvider");
    return context;
};