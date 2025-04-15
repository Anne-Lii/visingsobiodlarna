import { useState } from 'react'
import '../pages/Register.scss'

interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const Register = () => {

    //states
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<RegisterFormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: ''

    });

    //Hanterar ändringar i formuläret
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    //Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            //Skickar registreringsdata till backend
            const response = await fetch('URL', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Registrering misslyckades');
            }

            //Hantera framgångsrik registrering här (t.ex. visa en bekräftelse eller omdirigera)
           
        } catch (err) {
            setError('Ett fel inträffade. Försök igen senare.');
            console.error(err);
        }
    };

    return (
        <div>
            <h1>Registrera ny användare</h1>

            <form aria-labelledby="register-form" className="register-form">
                <div>
                    <label htmlFor="firstName">Förnamn</label>
                    <input type="text" id="firstName" name="firstName" value={formData.firstName}
                        onChange={handleChange} required/>
                </div>
                <div>
                    <label htmlFor="lastName">Efternamn</label>
                    <input type="text" id="lastName" name="lastName" value={formData.lastName}
                        onChange={handleChange} required
                    />
                </div>
                <div>
                    <label htmlFor="email">E-postadress</label>
                    <input type="email" id="email" name="email" value={formData.email}
                        onChange={handleChange} required/>
                </div>
                <div>
                    <label htmlFor="password">Lösenord</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required/>
                </div>

                <div>
                    <button type="submit" className='register_button'>Registrera</button>
                </div>
            </form>

        </div>
    )
}

export default Register
