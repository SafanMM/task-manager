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

    useEffect(() => {
        // Get the logged-in user's ID
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
        console.log(userId)
        if (!userId) return; // Do not fetch if user is not logged in

        // Fetch tasks only for the logged-in user
        const taskQuery = query(collection(db, 'tasks'), where('userId', '==', userId));

        const unsubscribe = onSnapshot(taskQuery, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                order: doc.data().order || 0
            })) as Task[];

            console.log(tasksData)
            setTasks(tasksData.sort((a, b) => a.order - b.order));
        });

        return () => unsubscribe();
    }, [userId]); // Fetch tasks whenever userId changes

    // Categorizing tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate > today; // Exclude today's tasks
    });

    const completedTasks = tasks.filter(task => new Date(task.dueDate) < today);

    const inProgressTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime(); // Only today's tasks
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

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="task-columns" style={{ paddingBottom: 10 }}>
                    {/* To-Do Column */}
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
