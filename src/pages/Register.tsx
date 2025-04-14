import '../pages/Register.scss'

const Register = () => {
    return (
        <div>
            <h1>Registrera ny användare</h1>

            <form aria-labelledby="register-form" className="register-form">
                <div>
                    <label htmlFor="firstName">Förnamn</label>
                    <input type="text" id="firstName" name="firstName" required/>
                </div>
                <div>
                    <label htmlFor="lastName">Efternamn</label>
                    <input type="text" id="lastName" name="lastName" required
                    />
                </div>
                <div>
                    <label htmlFor="email">E-postadress</label>
                    <input type="email" id="email" name="email" required/>
                </div>
                <div>
                    <label htmlFor="password">Lösenord</label>
                    <input type="password" id="password" name="password" required/>
                </div>

                <div>
                    <button type="submit" className='register_button'>Registrera</button>
                </div>
            </form>

        </div>
    )
}

export default Register
