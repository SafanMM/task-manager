import React, { useState } from 'react';
import { auth, db } from '../firebase'; // ✅ Import auth
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { FaTags, FaCalendarAlt, FaTasks, FaPlus, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Required for accessibility

const TaskForm: React.FC<{ onTaskAdded: () => void }> = ({ onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !category || !dueDate) {
            alert('Please fill in all required fields.');
            return;
        }

        if (!auth.currentUser) {
            alert('User not logged in.');
            return;
        }

        try {
            const q = query(collection(db, 'tasks'), orderBy('order', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);
            const lastOrder = querySnapshot.docs[0]?.data()?.order ?? 0;

            await addDoc(collection(db, 'tasks'), {
                title,
                category,
                userId: auth.currentUser?.uid, // ✅ Store logged-in user's ID
                dueDate: dueDate.toISOString(),
                status: status,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                order: lastOrder + 1
            });

            // Reset form fields
            setTitle('');
            setCategory('');
            setDueDate(null);
            setTags('');
            setStatus('');
            onTaskAdded();
            setIsModalOpen(false); // Close modal after adding task
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        }
    };

    return (
        <>

            <button className="btn btn-primary btn-logout-right" onClick={() => setIsModalOpen(true)} style={{ borderRadius: 50 }}>
                Add Task
            </button>
            <div className="task-form-container">
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={() => setIsModalOpen(false)}
                    className="modal-content"
                    overlayClassName="modal-overlay"
                >
                    <div className="modal-header">
                        <h2>Create a New Task</h2>
                        <button className="close-button" onClick={() => setIsModalOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="task-form">
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

                        <div className="input-group">
                            <FaCalendarAlt className="input-icon" />
                            <input
                                type="date"
                                className="form-control"
                                onChange={(e) => setDueDate(new Date(e.target.value))}
                                required
                            />
                        </div>

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

                        <button type="submit" className="btn btn-success">
                            <FaPlus /> Add Task
                        </button>
                    </form>
                </Modal>
            </div>
        </>
    );
};

export default TaskForm;
