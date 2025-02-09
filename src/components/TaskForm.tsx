// src/components/TaskForm.tsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

const TaskForm: React.FC<{ onTaskAdded: () => void }> = ({ onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [tags, setTags] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title || !category || !dueDate) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            // Get current maximum order value
            const q = query(
                collection(db, 'tasks'),
                orderBy('order', 'desc'),
                limit(1)
            );
            
            const querySnapshot = await getDocs(q);
            const lastOrder = querySnapshot.docs[0]?.data()?.order ?? 0;
            
            // Add new task with proper order
            await addDoc(collection(db, 'tasks'), {
                title,
                category,
                dueDate: dueDate.toISOString(),
                completed: false,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                order: lastOrder + 1
            });

            // Reset form fields
            setTitle('');
            setCategory('');
            setDueDate(null);
            setTags('');
            onTaskAdded();
            
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 p-3 border rounded">
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
            </div>
            
            <div className="mb-3">
                <input
                    type="date"
                    className="form-control"
                    onChange={(e) => setDueDate(new Date(e.target.value))}
                    required
                />
            </div>
            
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
            </div>
            
            <button type="submit" className="btn btn-primary">
                Add Task
            </button>
        </form>
    );
};

export default TaskForm;