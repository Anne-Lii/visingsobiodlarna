import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { JSX } from "react";


const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isLoggedIn, isLoading } = useUser();

    if (isLoading) {
        return <div>Laddar...</div>; 
      }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    console.log("🔐 ProtectedRoute", { isLoading, isLoggedIn });//debugg!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    return children;
};

export default ProtectedRoute
