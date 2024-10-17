import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTaskStatus, deleteTask, Task } from '../utils/firebase';
import { Trash2, Calendar, AlertCircle } from 'lucide-react';

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user, userRole } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks as Task[]);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId;
      try {
        await updateTaskStatus(draggableId, newStatus);
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === draggableId ? { ...task, status: newStatus } : task
          )
        );
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (userRole !== 'admin') return;

    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getDueDateColor = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-500';
    if (diffDays <= 2) return 'text-orange-500';
    if (diffDays <= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  const columns = ['to-do', 'in-progress', 'completed'];

  return (
    <div className="flex space-x-4 overflow-x-auto p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map(column => (
          <div key={column} className="flex-1 min-w-[250px]">
            <h3 className="text-lg font-semibold mb-2 capitalize">{column}</h3>
            <Droppable droppableId={column}>
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-100 p-2 rounded-md min-h-[500px]"
                >
                  {tasks
                    .filter(task => task.status === column)
                    .map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 mb-2 rounded-md shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-gray-500">{task.description}</p>
                              </div>
                              {userRole === 'admin' && (
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            <div className={`mt-2 flex items-center text-sm ${getDueDateColor(task.dueDate)}`}>
                              <Calendar size={14} className="mr-1" />
                              {new Date(task.dueDate).toLocaleDateString()}
                              {new Date(task.dueDate) < new Date() && (
                                <AlertCircle size={14} className="ml-1" />
                              )}
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;