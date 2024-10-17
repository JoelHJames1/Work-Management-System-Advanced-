import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { sendMessage, subscribeToMessages } from '../utils/firebase';
import { Send, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: any;
}

const MessageSystem: React.FC = () => {
  const { user } = useAuth();
  const { receiverId } = useParams<{ receiverId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && receiverId) {
      const conversationId = [user.uid, receiverId].sort().join('_');
      const unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
        setMessages(newMessages);
      });

      return () => unsubscribe();
    }
  }, [user, receiverId]);

  const handleSendMessage = async () => {
    if (user && receiverId && newMessage.trim()) {
      try {
        await sendMessage(user.uid, receiverId, newMessage);
        setNewMessage('');
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-sm p-4">
        <Link to="/dashboard" className="flex items-center text-blue-500 hover:text-blue-600">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to User List
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.senderId === user?.uid ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.senderId === user?.uid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.message}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp?.toDate().toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageSystem;