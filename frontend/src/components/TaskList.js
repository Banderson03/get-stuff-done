import React, { useState } from 'react';
import TaskItem from './TaskItem';

function TaskList() {

  // Initial state with some example tasks (This is just a mockup for now so we can fetch from database here instead)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Task 1: Design Mockups', summary: 'Create initial design mockups for the user interface.' },
    { id: 2, title: 'Task 2: Setup Database', summary: '' },
    { id: 3, title: 'Task 3: Implement Auth', summary: 'Set up user authentication flow.' },
    { id: 4, title: 'Task 4: Build API Endpoints', summary: '' },
    { id: 5, title: 'Task 5: Frontend Logic', summary: 'Connect frontend components to the API.' },

    // Add more tasks as needed
  ]);

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
    maxHeight: '800px',
    overflowY: 'auto',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
  },
};

export default TaskList;