import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/apiService";
import '../pages/ResetPassword.scss';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const email = params.get("email") || "";
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        token,
        newPassword
      });
      setMessage(response.data || "Lösenordet har återställts.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      console.error(err);
      setError("Kunde inte återställa lösenord. Länken kan vara ogiltig eller ha gått ut.");
    }
  };

  useEffect(() => {
    if (!email || !token) {
      setError("Ogiltig eller ofullständig återställningslänk.");
    }
  }, [email, token]);

  return (
    <div className="reset-password-container">
      <h1>Återställ lösenord</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {!error && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="newPassword">Nytt lösenord</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmPassword">Bekräfta nytt lösenord</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">Spara nytt lösenord</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
