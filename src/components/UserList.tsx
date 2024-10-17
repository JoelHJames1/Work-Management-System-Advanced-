import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, subscribeToUserStatus, getTasks } from '../utils/firebase';
import { User, MessageCircle } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  isOnline: boolean;
  lastSeen: any;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks('');
        setTasks(fetchedTasks as Task[]);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchUsers();
    fetchTasks();

    const unsubscribe = subscribeToUserStatus((updatedUsers) => {
      setUsers(updatedUsers);
    });

    return () => unsubscribe();
  }, []);

  const formatLastSeen = (lastSeen: any) => {
    if (!lastSeen) return 'Never';
    const lastSeenDate = lastSeen.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return lastSeenDate.toLocaleDateString();
  };

  const getUserTasks = (userId: string) => {
    return tasks.filter(task => task.assignedTo === userId);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <ul className="space-y-4">
        {users.filter(u => u.id !== user?.uid).map((userData) => (
          <li key={userData.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-8 w-8 text-gray-400 mr-2" />
              <div>
                <p className="font-medium">{userData.email}</p>
                <p className="text-sm text-gray-500">
                  {userData.isOnline ? 'Online' : `Last seen: ${formatLastSeen(userData.lastSeen)}`}
                </p>
                <p className="text-sm text-gray-500">
                  Current tasks: {getUserTasks(userData.id).map(task => task.title).join(', ')}
                </p>
              </div>
            </div>
            <Link
              to={`/messages/${userData.id}`}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
            >
              <MessageCircle className="h-5 w-5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;