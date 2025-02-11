import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, onSnapshot, query, where, doc, writeBatch } from 'firebase/firestore';
import { Task } from '../types';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';
import TaskItem from './TaskItem';
import TaskEditForm from './TaskEditForm';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!userId) return;

        const taskQuery = query(collection(db, 'tasks'), where('userId', '==', userId));

        const unsubscribe = onSnapshot(taskQuery, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                order: doc.data().order || 0
            })) as Task[];

            setTasks(tasksData.sort((a, b) => a.order - b.order));
        });

        return () => unsubscribe();
    }, [userId]);

    // Categorizing tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredTasks = tasks;

    // Apply category filter
    if (selectedCategory) {
        filteredTasks = filteredTasks.filter(task => task.category === selectedCategory);
    }

    // Apply due date filter (Fix)
    if (selectedDate) {
        filteredTasks = filteredTasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            const selectedDateObj = new Date(selectedDate);
            selectedDateObj.setHours(0, 0, 0, 0);
            return taskDate.getTime() === selectedDateObj.getTime();
        });
    }

    // Apply search filter
    if (searchTerm.trim()) {
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            task.dueDate.toLowerCase().includes(searchTerm.toLowerCase()) || 
            task.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const pendingTasks = filteredTasks.filter(task => new Date(task.dueDate) > today);
    const completedTasks = filteredTasks.filter(task => new Date(task.dueDate) < today);
    const inProgressTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
    });

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleEditComplete = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;

        const items = Array.from(tasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setTasks(items);

        const batch = writeBatch(db);
        items.forEach((task, index) => {
            const taskRef = doc(db, 'tasks', task.id);
            batch.update(taskRef, { order: index });
        });
        await batch.commit();
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedDate('');
    };

    return (
        <div className="task-board">
            {/* Task Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleEditComplete}
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                {editingTask && (
                    <TaskEditForm task={editingTask} onUpdate={handleEditComplete} onCancel={handleEditComplete} />
                )}
            </Modal>

            {/* Filters Section */}
            <div className="filter-container">
                <input
                    type="text"
                    placeholder="🔍 Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-input"
                />

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                >
                    <option value="">📂 All Categories</option>
                    <option value="Work">👨‍💼 Work</option>
                    <option value="Personal">🏠 Personal</option>
                    <option value="Shopping">🛍️ Shopping</option>
                    <option value="Fitness">💪 Fitness</option>
                </select>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="filter-input"
                />

                <button onClick={handleClearFilters} className="btn-clear">
                    Clear Filters
                </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="task-columns">
                    <StrictModeDroppable droppableId="todo">
                        {(provided) => (
                            <div className="task-column todo" ref={provided.innerRef} {...provided.droppableProps}>
                                <h2>To-Do ({pendingTasks.length})</h2>
                                {pendingTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                <TaskItem task={task} onEdit={() => handleEdit(task)} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </StrictModeDroppable>

                    {/* In Progress Column */}
                    <StrictModeDroppable droppableId="inprogress">
                        {(provided) => (
                            <div className="task-column in-progress" ref={provided.innerRef} {...provided.droppableProps}>
                                <h2>In Progress ({inProgressTasks.length})</h2>
                                {inProgressTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                <TaskItem task={task} onEdit={() => handleEdit(task)} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </StrictModeDroppable>

                    {/* Completed Column */}
                    <StrictModeDroppable droppableId="completed">
                        {(provided) => (
                            <div className="task-column completed" ref={provided.innerRef} {...provided.droppableProps}>
                                <h2>Completed ({completedTasks.length})</h2>
                                {completedTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                <TaskItem task={task} onEdit={() => handleEdit(task)} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </StrictModeDroppable>
                </div>
            </DragDropContext>
        </div>
    );
};

export default TaskList;
