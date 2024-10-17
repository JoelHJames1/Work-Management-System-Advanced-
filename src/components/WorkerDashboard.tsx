import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../utils/firebase';

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: string;
}

const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (user) {
        try {
          setLoading(true);
          const fetchedTasks = await getTasks(user.uid);
          setTasks(fetchedTasks as Task[]);
          setError(null);
        } catch (err) {
          console.error('Error fetching tasks:', err);
          setError('Failed to load tasks. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTasks();
  }, [user]);

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks assigned to you at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between bg-gray-100 p-4 rounded-md"
            >
              <span>{task.title}</span>
              <span className="text-sm text-gray-500">Status: {task.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkerDashboard;