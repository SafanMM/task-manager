// src/components/TaskItem.tsx
import React from 'react';
import { Task } from '../types';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const handleDelete = async () => {
        const taskRef = doc(db, 'tasks', task.id);
        await deleteDoc(taskRef);
    };

    return (
        <div>
            <h3>{task.title}</h3>
            <p>Category: {task.category}</p>
            <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
            <p>Tags: {task.tags.join(', ')}</p>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
    );
};

export default TaskItem;