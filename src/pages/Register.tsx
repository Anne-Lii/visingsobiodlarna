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

        const errors = []; //frontend validering

        if (!formData.firstName.trim()) errors.push("Förnamn måste anges.");
        if (!formData.lastName.trim()) errors.push("Efternamn måste anges.");
        if (!formData.email.trim()) {
            errors.push("E-postadress måste anges.");
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.push("Ange en giltig e-postadress.");
        }

        if (!formData.password) {
            errors.push("Lösenord måste anges.");
        } else {
            if (formData.password.length < 6) {
                errors.push("Lösenordet måste vara minst 6 tecken.");
            }
            if (!/\d/.test(formData.password)) {
                errors.push("Lösenordet måste innehålla minst en siffra.");
            }
        }

        if (errors.length > 0) {
            setError(errors);
            setIsSubmitting(false);
            return;
        }

        //Backend-anrop
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
                console.error("FELSVAR FRÅN BACKEND:", err.response.data); // 👈 Logga allt
        
                const data = err.response.data;
                let backendErrors: string[] = [];
        
                if (Array.isArray(data)) {
                    // Om backend svarar med en lista
                    backendErrors = data.map((e: any) => e.Description ?? e.description ?? "Ett fel inträffade.");
                } else if (typeof data === "object" && data.errors) {
                    // Om backend skickar { errors: { fält: [felmeddelande] } }
                    for (const key in data.errors) {
                        backendErrors.push(...data.errors[key]);
                    }
                } else if (typeof data === "string") {
                    backendErrors = [data];
                } else if (data.title) {
                    backendErrors = [data.title];
                }
        
                // Översätt eventuella felmeddelanden
                const translatedErrors = backendErrors.map((msg) => {
                    if (msg.toLowerCase().includes("username") && msg.toLowerCase().includes("taken")) {
                        return "E-postadressen är redan registrerad.";
                    }
                    return msg;
                });
        
                if (translatedErrors.length > 0) {
                    setError(translatedErrors);
                } else {
                    setError("Ett oväntat fel inträffade.");
                }
        
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
                        onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="lastName">Efternamn</label>
                    <input type="text" id="lastName" name="lastName" value={formData.lastName}
                        onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="email">E-postadress</label>
                    <input type="email" id="email" name="email" value={formData.email}
                        onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="password">Lösenord</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
                    <p className="password-hint">
                        Lösenord måste innehålla minst 6 tecken och minst en siffra.
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        {typeof error === 'string' ? (
                            <p>{error}</p>
                        ) : Array.isArray(error) && error.length > 0 ? (
                            error.map((err, index) => (
                                <p key={index}>{err}</p>
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
