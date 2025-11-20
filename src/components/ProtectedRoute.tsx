import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { JSX } from "react";


interface ProtectedRouteProps {
    children: JSX.Element;
    requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { isLoggedIn, isLoading, role } = useUser();

    if (isLoading) {
        return <div>Laddar...</div>; 
      }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/" replace />; //användaren skickas till startsidan om användaren ej är admin
      }

    return children;
};

export default ProtectedRoute
