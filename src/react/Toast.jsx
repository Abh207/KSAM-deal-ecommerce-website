import React, { useEffect } from "react";

const Toast = ({ message, productName, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 2500);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="beauty-toast" role="status">
            <div className="beauty-toast-icon">
                ✓
            </div>

            <div className="beauty-toast-content">
                <strong>{message}</strong>

                {productName && (
                    <span>{productName}</span>
                )}
            </div>

            <button
                type="button"
                className="beauty-toast-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
};

export default Toast;