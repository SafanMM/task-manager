import React from 'react';
import { Task } from '../types';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { FaEdit, FaTrash } from 'react-icons/fa';

const TaskItem: React.FC<{ task: Task; onEdit: () => void }> = ({ task, onEdit }) => {
    const handleDelete = async () => {
        const taskRef = doc(db, 'tasks', task.id);
        await deleteDoc(taskRef);
    };

    // Convert due date to "DD-MM-YYYY" or "Today" if it's today
    const formatDueDate = (dueDate: string) => {
        const taskDate = new Date(dueDate);
        const today = new Date();
        
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === today.getTime()) {
            return 'Today';
        }

        const day = String(taskDate.getDate()).padStart(2, '0');
        const month = String(taskDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = taskDate.getFullYear();

        return `${day}-${month}-${year}`;
    };

    return (
        <div className="task-item">
            <div>
                <h3>Task: {task.title}</h3>
                <p>Task Category: <strong>{task.category}</strong></p>
                <p>Due on: {formatDueDate(task.dueDate)}</p>
                {task.tags.length > 0 && <p>Tags: {task.tags.join(', ')}</p>}
            </div>
            <div>
                <button onClick={onEdit} className="btn btn-light" style={{ marginRight: 5 }}>
                    <FaEdit /> Edit
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                    <FaTrash /> Delete
                </button>
            </div>
        </div>
    );
};

export default TaskItem;
