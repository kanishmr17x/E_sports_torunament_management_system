import React, { useState } from 'react';
import "../styles/confirmModal.css";

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Delete", 
  message = "Are you sure you want to delete this? This action can be undone.",
  isLoading = false,
  showReasonInput = false,
  _onReasonChange = () => {}
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (showReasonInput) {
      onConfirm(reason);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <p className="modal-message">{message}</p>
        
        {showReasonInput && (
          <div className="confirm-modal-reason">
            <label>Reason (required)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              rows="3"
            />
          </div>
        )}
        
        <div className="modal-actions">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-outline"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isLoading || (showReasonInput && !reason.trim())}
            className="btn btn-danger"
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
