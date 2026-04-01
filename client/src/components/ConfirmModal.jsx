import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Delete", 
  message = "Are you sure you want to delete this? This action can be undone.",
  isLoading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        className="modal-content"
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 
          style={{
            color: '#fff',
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600'
          }}
        >
          {title}
        </h3>
        
        <p 
          style={{
            color: '#9aa0aa',
            margin: '0 0 24px 0',
            lineHeight: '1.5'
          }}
        >
          {message}
        </p>
        
        <div 
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-outline"
            style={{
              padding: '8px 16px',
              border: '1px solid #444',
              backgroundColor: 'transparent',
              color: '#9aa0aa',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              border: '1px solid #dc3545',
              color: '#fff',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
