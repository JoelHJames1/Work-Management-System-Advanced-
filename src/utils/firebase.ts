// Add these imports at the top of the file
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Add these functions at the end of the file

export const initializeNotifications = async (userId: string) => {
  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
      await setDoc(doc(db, 'users', userId), { notificationToken: token }, { merge: true });
      console.log('Notification permission granted.');
    } else {
      console.log('Notification permission denied.');
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
};

export const listenForNotifications = (callback: (payload: any) => void) => {
  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

export const sendNotificationToUser = async (userId: string, title: string, body: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && userDoc.data().notificationToken) {
      const message = {
        notification: {
          title,
          body,
        },
        token: userDoc.data().notificationToken,
      };
      await sendFCMMessage(messaging, message);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Update the addTask function to include notification
export const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: serverTimestamp(),
    });
    
    // Send notification to assigned user
    await sendNotificationToUser(
      taskData.assignedTo,
      'New Task Assigned',
      `You have been assigned a new task: ${taskData.title}`
    );

    return docRef.id;
  } catch (error) {
    logError('Error adding task', error);
    throw new Error('Unable to add task. Please try again.');
  }
};

// Update the updateTaskStatus function to include notification
export const updateTaskStatus = async (taskId: string, newStatus: string) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { status: newStatus });

    const task = await getTaskById(taskId);
    if (task) {
      await sendNotificationToUser(
        task.assignedTo,
        'Task Status Updated',
        `The status of your task "${task.title}" has been updated to ${newStatus}`
      );
    }
  } catch (error) {
    logError('Error updating task status', error);
    throw new Error('Unable to update task status. Please try again.');
  }
};