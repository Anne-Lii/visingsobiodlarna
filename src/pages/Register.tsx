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
                let backendError: string[] = [];
                const data = err.response.data;

                if (data.errors && typeof data.errors === 'object') {
                    for (const key in data.errors) {
                        backendError.push(...data.errors[key]);
                    }
                } else if (Array.isArray(data)) {
                    backendError = data.map((e: any) => e.description);
                } else if (data.$values) {
                    backendError = data.$values.map((e: any) => e.description);
                } else if (typeof data === "string") {
                    backendError = [data];
                } else if (data.title) {
                    backendError = [data.title];
                } else {
                    backendError = ["Ett fel inträffade."];
                }

                //Översätter felmeddelande till svenska
                const translatedErrors = backendError.map((msg) => {
                    if (
                        typeof msg === "string" &&
                        msg.toLowerCase().includes("username") &&
                        msg.toLowerCase().includes("taken")
                    ) {
                        return "E-postadressen är redan registrerad.";
                    }
                    return msg;
                });

                setError(translatedErrors);
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
