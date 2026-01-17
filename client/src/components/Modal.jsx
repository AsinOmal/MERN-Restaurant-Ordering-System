import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info',
    children // Support for form content
}) => {

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleContentClick = (e) => e.stopPropagation();

    // If children provided (form), render differently
    if (children) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content modal-form" onClick={handleContentClick}>
                    {children}
                </div>
            </div>
        );
    }

    // Default confirmation dialog
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content modal-${type}`} onClick={handleContentClick}>
                <div className="modal-header">
                    <span className="modal-icon">
                        {type === 'danger' ? <i className="fas fa-exclamation-circle"></i> : <i className="fas fa-info-circle"></i>}
                    </span>
                    <h3 className="modal-title">{title}</h3>
                </div>

                <div className="modal-body">
                    <p>{message}</p>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-outline" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${type === 'danger' ? 'btn-primary' : 'btn-success'}`}
                        style={type === 'danger' ? { backgroundColor: 'var(--color-error)' } : {}}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
