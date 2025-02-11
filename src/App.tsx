import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import Login from './components/Login';
import TaskList from './components/TaskList';
import BoardView from './components/BoardView';
import TaskForm from './components/TaskForm';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert('Logged out successfully!');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleTaskAdded = () => {
        alert('Task added successfully!');
    };

    return (
        <div className="container">
            {user ? (
                <>
                    {/* Navbar */}
                    <div className="navbar">
                        <h1 className="app-title">TaskBuddy</h1>
                        <div className="user-info">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="profile-pic" />
                            ) : (
                                <span className="default-avatar">👤</span> // Fallback avatar
                            )}
                            <span>{user.displayName || user.email}</span>
                        </div>
                    </div>

                    {/* List/Board Toggle */}
                    <div className="toggle-container">
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            📄 List
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
                            onClick={() => setViewMode('board')}
                        >
                            🗂️ Board
                        </button>
                        <TaskForm onTaskAdded={handleTaskAdded} />
                        <button className="btn btn-danger logout-btn" onClick={handleLogout}>Logout</button>
                    </div>

                    {/* Task View (Responsive) */}
                    <div className="task-view">
                        {viewMode === 'list' ? <TaskList /> : <BoardView />}
                    </div>
                </>
            ) : (
                <Login onLogin={() => setUser(auth.currentUser)} />
            )}
        </div>
    );
};

export default App;
