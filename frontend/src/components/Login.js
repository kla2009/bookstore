import { useState } from "react";

function Login({ onLogin }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {

        e.preventDefault();

        const user = {
            email,
            password
        };

        onLogin(user);
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <div className="auth-icon">
                    🔐
                </div>

                <h2>Welcome Back</h2>

                <p className="auth-description">
                    Login to your Book Management account
                </p>


                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="auth-button"
                    >
                        Login
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;