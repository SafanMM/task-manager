import React from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            onLogin();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <h1 className="login-title">TaskBuddy</h1>
                <p className="login-subtitle">
                    Streamline your workflow and track progress effortlessly.
                </p>
                <button className="google-btn" onClick={handleLogin}>
                    <FaGoogle style={{ marginRight: 5, marginTop: -2 }} />{" "} Continue with Google
                </button>
            </div>
        </div>
    );
};

export default Login;

