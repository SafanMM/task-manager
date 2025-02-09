// src/App.tsx
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut
import Login from './components/Login';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

const App: React.FC = () => {
    const [user, setUser ] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser ) => {
            setUser (currentUser );
        });
        return () => unsubscribe(); // Clean up subscription on unmount
    }, []);

    const handleTaskAdded = () => {
        alert('Task added successfully!'); // Use alert instead of toast
    };

    const handleLogout = async () => {
        try {
            await signOut(auth); // Sign out the user
            alert('Logged out successfully!'); // Optional: Show a message
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="container">
            {user ? (
                <>
                    <h1>Task Manager</h1>
                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button> {/* Logout button */}
                    <TaskForm onTaskAdded={handleTaskAdded} />
                    <TaskList />
                </>
            ) : (
                <Login onLogin={() => setUser (auth.currentUser )} />
            )}
        </div>
    );
};

export default App;