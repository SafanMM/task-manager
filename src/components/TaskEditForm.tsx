import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Task } from '../types';
import { FaTags, FaCalendarAlt, FaTasks, FaSave, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Required for accessibility

const TaskEditForm: React.FC<{ task: Task; onUpdate: () => void; onCancel: () => void }> = ({ task, onUpdate, onCancel }) => {
    const [title, setTitle] = useState(task.title);
    const [category, setCategory] = useState(task.category);
    const [dueDate, setDueDate] = useState(new Date(task.dueDate));
    const [tags, setTags] = useState(task.tags.join(', '));
    const [status, setStatus] = useState(task.status);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !category || !dueDate) {
            alert('Please fill in all fields.');
            return;
        }

        const taskRef = doc(db, 'tasks', task.id);
        await updateDoc(taskRef, {
            title,
            category,
            dueDate: dueDate.toISOString(),
            tags: tags.split(',').map(tag => tag.trim()),
            status: status
        });

        onUpdate();
    };

    return (
        <Modal
            isOpen={true}
            onRequestClose={onCancel}
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <div className="modal-header">
                <h2>Edit Task</h2>
                <button className="close-button" onClick={onCancel}>
                    <FaTimes />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="task-form">
                {/* Task Title */}
                <div className="input-group">
                    <FaTasks className="input-icon" />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* Category Dropdown */}
                <div className="input-group">
                    <select
                        className="form-control"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="Work">Work</option>
                        <option value="Personal">Personal</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Fitness">Fitness</option>
                    </select>
                </div>

                {/* Due Date */}
                <div className="input-group">
                    <FaCalendarAlt className="input-icon" />
                    <input
                        type="date"
                        className="form-control"
                        value={dueDate.toISOString().split('T')[0]}
                        onChange={(e) => setDueDate(new Date(e.target.value))}
                        required
                    />
                </div>

                {/* Tags */}
                <div className="input-group">
                    <FaTags className="input-icon" />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tags (comma separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <select
                        className="form-control"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                    >
                        <option value="">Select Task Status</option>
                        <option value="TO-DO">TO-DO</option>
                        <option value="IN-PROGRESS">IN-PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>
                </div>

                {/* Buttons in one line */}
                <div className="button-group">
                    <button type="submit" className="btn btn-success">
                        <FaSave /> Save Changes
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        <FaTimes /> Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskEditForm;
