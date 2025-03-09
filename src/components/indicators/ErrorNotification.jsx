import React from 'react';

function ErrorNotification({ message, onClose }) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
      <p>{message}</p>
      <button 
        onClick={onClose}
        className="absolute top-1 right-1 text-white hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
}

export default ErrorNotification;

