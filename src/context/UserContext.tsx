import { ReactNode, createContext, useContext, useState } from "react";


type UserContextType = {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
};

const UserContext = createContext<UserContextType |  undefined>(undefined);
export const UserProvider = ({children}:{children: ReactNode}) => {

    //states
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = () => setIsLoggedIn(true);
    const logout = () => setIsLoggedIn(false);

    return (
        <UserContext.Provider value={{ isLoggedIn, login, logout }}>
          {children}
        </UserContext.Provider>
      );

};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser måste användas inom UserProvider");
    return context;
  };