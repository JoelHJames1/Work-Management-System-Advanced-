import React, { useState, useEffect } from 'react';
import { getTasks, Task } from '../utils/firebase';
import { Calendar, Clock } from 'lucide-react';

const CalendarView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const renderCalendar = () => {
    const calendar = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(<td key={`empty-${j}`} className="p-2 border"></td>);
        } else if (day > daysInMonth) {
          break;
        } else {
          const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const tasksForDay = tasks.filter(task => new Date(task.dueDate).toDateString() === currentDay.toDateString());
          
          week.push(
            <td key={day} className="p-2 border">
              <div className="font-bold">{day}</div>
              {tasksForDay.map(task => (
                <div key={task.id} className="text-xs bg-blue-100 p-1 mt-1 rounded">
                  {task.title}
                </div>
              ))}
            </td>
          );
          day++;
        }
      }
      calendar.push(<tr key={i}>{week}</tr>);
      if (day > daysInMonth) break;
    }

    return calendar;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Calendar View</h2>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="px-2 py-1 bg-gray-200 rounded">&lt;</button>
          <span className="font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <button onClick={nextMonth} className="px-2 py-1 bg-gray-200 rounded">&gt;</button>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <th key={day} className="p-2 border">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderCalendar()}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarView;