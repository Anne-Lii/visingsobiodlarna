import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { JSX } from "react";


const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isLoggedIn } = useUser();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute
