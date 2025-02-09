// src/components/Login.tsx
import React from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
        <div className="text-center">
            <h1>Login</h1>
            <button className="btn btn-primary" onClick={handleLogin}>Sign in with Google</button>
        </div>
    );
};

export default Login;