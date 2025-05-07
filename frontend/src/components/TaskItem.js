import React, { useState } from 'react';
import { getDatabase, ref, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';

function TaskItem({ task, onSummaryChange }) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = getAuth().currentUser;

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

  return (
    <div style={styles.taskItem}>
      <h3 style={styles.title}>{task.title}</h3>
      <h4>Suggested Strategy: {task.summary}</h4>
      <textarea
        style={styles.summaryInput}
        value={feedback}
        onChange={handleFeedbackChange}
        placeholder="Enter feedback..."
        rows={3}
      />
      <br></br>

      <button
        className="submit-button"
        style={styles.submitButton}
        onClick={handleSubmitFeedback}
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
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
    marginTop: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1em',
    resize: 'none',
  },
};

export default TaskItem;