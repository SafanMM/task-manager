// src/components/TaskEditForm.tsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Task } from '../types';

const TaskEditForm: React.FC<{ task: Task; onUpdate: () => void; onCancel: () => void }> = ({ task, onUpdate, onCancel }) => {
    const [title, setTitle] = useState(task.title);
    const [category, setCategory] = useState(task.category);
    const [dueDate, setDueDate] = useState(new Date(task.dueDate));
    const [tags, setTags] = useState(task.tags.join(', '));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !category || !dueDate) {
            alert('Please fill in all fields.'); // Use alert instead of toast
            return;
        }

        const taskRef = doc(db, 'tasks', task.id);
        await updateDoc(taskRef, {
            title,
            category,
            dueDate: dueDate.toISOString(),
            tags: tags.split(',').map(tag => tag.trim()),
        });
        onUpdate();
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
                <input type="date" value={dueDate.toISOString().split('T')[0]} onChange={(e) => setDueDate(new Date(e.target.value))} required />
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
                <button type="submit" className="btn btn-primary">Update Task</button>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            </form>
        </div>
    );
};

export default TaskEditForm;