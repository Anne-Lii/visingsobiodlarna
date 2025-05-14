import { useState } from "react";
import api from "../services/apiService";
import '../pages/NewPassword.scss';

const NewPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.data || "Om kontot existerar skickas ett mejl med återställningslänk.");
    } catch (err: any) {
      console.error(err);
      setError("Något gick fel, försök igen.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h1>Glömt lösenord?</h1>
      <p>Fyll i din e-postadress så skickar vi en återställningslänk.</p>

      <form onSubmit={handleSubmit}>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <label htmlFor="email">E-postadress</label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Skicka återställningslänk</button>
      </form>
    </div>
  );
};

export default NewPassword;
