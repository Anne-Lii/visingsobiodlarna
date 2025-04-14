import { NavLink } from "react-router-dom"
import '../pages/Login.scss'


const Login = () => {
  return (
    <div className="login-container">
      <h1>Inloggning</h1>

      <form aria-labelledby="login-form">
        <div className="form-group">
          <label htmlFor="email">E-postadress</label>
          <input type="email" id="email" name="email" autoComplete="email" required />
        </div>

        <div className="form-group">
          <label htmlFor="password">Lösenord</label>
          <input type="password" id="password" name="password" autoComplete="current-password" required />
          <p><NavLink to="/new_password">Glömt lösenord?</NavLink></p>
        </div>
        <div className="">
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
