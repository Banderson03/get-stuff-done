import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import { getDatabase, ref, get, push, set, onValue, off } from 'firebase/database';
import { getAuth, onAuthStateChanged } from "firebase/auth";

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setupTasksListener(u.uid);
      } else {
        setUser(null);
        // Clear tasks when user logs out
        setTasks([]);
      }
    });
    
    return () => {
      unsubscribe();
      // Clean up database listeners when component unmounts
      if (user) {
        const db = getDatabase();
        const tasksRef = ref(db, `users/${user.uid}/tasks`);
        off(tasksRef);
      }
    };
  }, []);

  /**
   * Sets up a real-time listener for tasks in the database
   * @param {string} uid The user ID to listen for tasks for
   */
  const setupTasksListener = (uid) => {
    const db = getDatabase();
    const tasksRef = ref(db, `users/${uid}/tasks`);
    
    // Use onValue to listen for changes
    onValue(tasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const tasksData = snapshot.val();
        const tasksList = Object.keys(tasksData).map((key) => ({
          id: key,
          title: tasksData[key].task || 'Untitled Task',
          summary: tasksData[key].strategy || '',
          startDate: tasksData[key].startDate || '',
          endDate: tasksData[key].endDate || '',
          feedback: tasksData[key].feedback || '',
        }));
        
        // Sort tasks - completed tasks (with endDate) at the bottom, older tasks first
        const sortedTasks = tasksList.sort((a, b) => {
          // First check if either task is completed (has endDate)
          const aCompleted = !!a.endDate;
          const bCompleted = !!b.endDate;
          
          // If completion status differs, completed tasks go to the bottom
          if (aCompleted !== bCompleted) {
            return aCompleted ? 1 : -1;
          }
          
          // If both are either completed or incomplete, sort by startDate (older first)
          if (aCompleted && bCompleted) {
            return new Date(b.startDate) - new Date(a.startDate);
          }
          return new Date(a.startDate) - new Date(b.startDate);
        });
        
        setTasks(sortedTasks);
      } else {
        console.log('No tasks found.');
        setTasks([]);
      }
    }, (error) => {
      console.error('Error listening for tasks:', error);
    });
  };

  // Handler function to update a task's summary
  const handleSummaryChange = (taskId, newSummary) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, summary: newSummary } : task
      )
    );
  };

  return (
    <div style={styles.taskListContainer}>
      <h2>My Tasks</h2>
      <div style={styles.scrollableArea}>
        {tasks.map(task => (
          <TaskItem
            key={task.id} 
            task={task}
            onSummaryChange={handleSummaryChange} 
          />
        ))}
      </div>
    </div>
  );
}

// Basic inline styles
const styles = {
  taskListContainer: {
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  scrollableArea: {
    marginTop: '10px',
    maxHeight: '975px',
    overflowY: 'auto',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
  },
};

export default TaskList;