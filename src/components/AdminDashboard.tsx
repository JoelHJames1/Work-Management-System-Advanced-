import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, CheckCircle, Upload } from 'lucide-react';
import {
  getTasks,
  addTask,
  completeTask,
  getWorkers,
  uploadFile,
} from '../utils/firebase';

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: 'to-do' | 'in-progress' | 'completed';
}

interface Worker {
  id: string;
  email: string;
  uid: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerMap, setWorkerMap] = useState<{ [key: string]: string }>({});
  const [newTask, setNewTask] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedTasks = await getTasks('');
        const fetchedWorkers = await getWorkers();
        setTasks(fetchedTasks as Task[]);
        setWorkers(fetchedWorkers as Worker[]);

        const workerEmailMap = fetchedWorkers.reduce(
          (acc: { [key: string]: string }, worker: Worker) => {
            acc[worker.uid] = worker.email;
            return acc;
          },
          {}
        );
        setWorkerMap(workerEmailMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask || !assignTo) {
      setTaskError('Please fill out both fields');
      return;
    }

    setTaskLoading(true);
    setTaskError('');

    try {
      const selectedWorker = workers.find((worker) => worker.id === assignTo);
      if (selectedWorker) {
        await addTask({
          title: newTask,
          description: '',
          assignedTo: selectedWorker.uid,
          dueDate: new Date().toISOString(),
          priority: 'medium',
          status: 'to-do',
        });
        setTasks((prevTasks) => [
          ...prevTasks,
          {
            id: new Date().toISOString(),
            title: newTask,
            assignedTo: selectedWorker.uid,
            status: 'to-do',
          },
        ]);
        setNewTask('');
        setAssignTo('');
      } else {
        setTaskError('Invalid worker selected');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      setTaskError('Failed to add task. Please try again.');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: 'completed' } : task
        )
      );
      await completeTask(taskId);
    } catch (error) {
      console.error('Error completing task:', error);
      setTaskError('Failed to mark task as complete.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }

    try {
      const downloadURL = await uploadFile(file, `uploads/${file.name}`);
      setUploadSuccess(`File uploaded successfully. Download URL: ${downloadURL}`);
      setUploadError('');
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file. Please try again.');
      setUploadSuccess('');
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">Admin Controls</h2>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Assign New Task</h3>
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter task title"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a worker</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.email}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddTask}
            disabled={taskLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            {taskLoading ? 'Adding...' : 'Add Task'}
          </button>
        </div>
        {taskError && (
          <p className="text-red-500 text-sm mb-4">{taskError}</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">File Upload</h3>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleFileUpload}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </button>
        </div>
        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
        {uploadSuccess && <p className="text-green-500 mt-2">{uploadSuccess}</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;