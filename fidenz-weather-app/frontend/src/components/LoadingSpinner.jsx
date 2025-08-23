import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${sizeClass[size]}`}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">{text}</span>
        </div>
      </div>
      <p className="loading-text text-light mt-3">{text}</p>
    </div>
  );
};

export default LoadingSpinner;