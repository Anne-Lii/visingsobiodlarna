import { NavLink, useNavigate } from "react-router-dom"
import '../pages/Login.scss'
import { useState } from "react"
import api from "../services/apiService";
import { useUser } from "../context/UserContext";


const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { login } = useUser();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {

      const response = await api.post("/auth/login", {email, password});
      console.log("Inloggad:", response.data.message);
      login();//sätter inloggningsstatus till inloggad
      navigate("/mypage");//skickas till skyddad vy mina sidor
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data || "Inloggning misslyckades.");
    }
  }

  return (
    <div className="login-container">
      <h1>Inloggning</h1>

      <form aria-labelledby="login-form" onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="email">E-postadress</label>
          <input type="email" id="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="password">Lösenord</label>
          <input type="password" id="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}required />
          <p><NavLink to="/new_password">Glömt lösenord?</NavLink></p>
        </div>

        <div className="form-group">
          <button type="submit" className="login-button">Logga in</button>

          <div className="register-prompt">
            <p> Har du inget konto?</p>
            <p><NavLink to="/register">Registrera dig</NavLink></p>
          </div>
        </div>

      </form>
    </div>
  )
}

export default Login
