import { useState } from 'react'
import '../pages/Register.scss'
import api from '../services/apiService';
import { useNavigate } from 'react-router-dom';

interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const Register = () => {
    const navigate = useNavigate();

    //states
    const [error, setError] = useState<string | string[] | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

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
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await api.post('/auth/register', formData);
            if (response.status === 200) {
                setSuccess(true);
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: ''
                });
            }
        } catch (err: any) {
            if (err.response && err.response.data) {
                const backendError = Array.isArray(err.response.data)
                    ? err.response.data.map((e: any) => e.description)
                    : (typeof err.response.data === "string"
                        ? err.response.data
                        : err.response.data.title || "Ett fel inträffade.");
                setError(backendError);
            } else {
                setError("Ett oväntat fel inträffade.");
            }
            console.error('Registreringsfel:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    //Meddelande vid lyckad registrering och skickas till inloggningssidan
    const handleSuccessOk = () => {
        setSuccess(false);
        navigate('/login');
    };

    return (
        <div>
            <h1>Registrera ny användare</h1>

            {success && (
                <div className="success-message">
                    <p>Registreringen lyckades! Vänta på godkännande från admin.</p>
                    <button onClick={handleSuccessOk}>OK</button>
                </div>
            )}



            <form aria-labelledby="register-form" className="register-form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="firstName">Förnamn</label>
                    <input type="text" id="firstName" name="firstName" value={formData.firstName}
                        onChange={handleChange} required />
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
                        onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="password">Lösenord</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                    <p className="password-hint">
                        Lösenord måste innehålla minst 6 tecken och minst en siffra.
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        {typeof error === 'string' ? (
                            <p>{error}</p>
                        ) : Array.isArray(error) ? (
                            (error as Array<{ description: string } | string>).map((err, index) =>
                                typeof err === "string" ? (
                                    <p key={index}>{err}</p>
                                ) : (
                                    <p key={index}>{err.description}</p>
                                ))
                        ) : (
                            <p>Ett oväntat fel inträffade.</p>
                        )}
                    </div>
                )}

                {isSubmitting && <p className="loading">Registrerar...</p>}

                <div>
                    <button type="submit" className='register_button'>Registrera</button>
                </div>
            </form>

        </div>
    )
}

export default Register
