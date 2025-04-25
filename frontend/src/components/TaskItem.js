import React from 'react';

function TaskItem({ task, onSummaryChange }) {
  const handleInputChange = (event) => {
    onSummaryChange(task.id, event.target.value);
  };

  return (
    <div style={styles.taskItem}>
      <h3 style={styles.title}>{task.title}</h3>
      <textarea
        style={styles.summaryInput}
        value={task.summary}
        onChange={handleInputChange}
        placeholder="Enter summary..."
        rows={3} 
      />
    </div>
  );
}

// Basic inline styles
const styles = {
  taskItem: {
    border: '2px solid #ccc',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: '#f9f9f9',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '1.2em',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
  },
  summaryInput: {
    width: '100%', 
    boxSizing: 'border-box', 
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1em',
    resize: 'vertical',
  },
};

export default TaskItem;