import React, { useState } from 'react';
import { getDatabase, ref, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';

function TaskItem({ task, onSummaryChange }) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = getAuth().currentUser;
  
  // Check if the task is completed (has an endDate)
  const isCompleted = !!task.endDate;
  
  // Format the start date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const handleInputChange = (event) => {
    onSummaryChange(task.id, event.target.value);
  };

  const handleSummaryChange = (event) => {
    onSummaryChange(task.id, event.target.value);
  };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleSubmitFeedback = async () => {
    if (!user) {
      alert('You must be signed in.');
      return;
    }
    if (feedback.trim() === '') {
      alert('Feedback cannot be empty.');
      return;
    }

    setSubmitting(true);

    try {
      const db = getDatabase();
      const taskRef = ref(db, `users/${user.uid}/tasks/${task.id}`);

      await update(taskRef, {
        feedback: feedback.trim(),
        endDate: new Date().toISOString()
      });

      alert('Feedback submitted successfully!');
      setFeedback(''); // Clear the feedback box
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  // Apply different styles for completed tasks
  const taskItemStyle = {
    ...styles.taskItem,
    ...(isCompleted && styles.completedTask)
  };

  return (
    <div style={taskItemStyle}>
      <div style={styles.taskHeader}>
        <h3 style={styles.title}>{task.title}</h3>
        <span style={styles.dateLabel}>
          {formatDate(task.startDate)}
        </span>
      </div>
      
      {isCompleted ? (
        <div>
          <h4>Suggested Strategy: {task.summary}</h4>
          <div style={styles.feedbackContainer}>
            <h4>Feedback:</h4>
            <p>{task.feedback}</p>
            <div style={styles.completedLabel}>
              Completed on {formatDate(task.endDate)}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h4>Suggested Strategy: {task.summary}</h4>
          <textarea
            style={styles.summaryInput}
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="Enter feedback..."
            rows={3}
          />
          <br />
          <button
            className="submit-button"
            style={styles.submitButton}
            onClick={handleSubmitFeedback}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback and Mark Complete'}
          </button>
        </div>
      )}
    </div>
  );
}

// Enhanced inline styles
const styles = {
  taskItem: {
    position: 'relative',
    border: '2px solid #ccc',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: '#f9f9f9',
  },
  completedTask: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
    marginBottom: '10px',
  },
  title: {
    margin: '0',
    fontSize: '1.2em',
    flex: '1',
  },
  dateLabel: {
    fontSize: '0.8em',
    color: '#888',
    marginLeft: '10px',
  },
  summaryInput: {
    width: '100%', 
    boxSizing: 'border-box', 
    padding: '8px',
    marginTop: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1em',
    resize: 'none',
  },
  submitButton: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  feedbackContainer: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    position: 'relative',
  },
  completedLabel: {
    marginTop: '10px',
    fontSize: '0.85em',
    color: '#888',
    fontStyle: 'italic',
  },
};

export default TaskItem;