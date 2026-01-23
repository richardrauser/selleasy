'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'danger' | 'info';
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    type = 'info',
    confirmLabel = 'OK',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false
}: ConfirmationModalProps) {

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.overlay} onClick={onCancel}>
            <div className={`${styles.modal} ${styles[`type-${type}`]}`} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    {onCancel && (
                        <button
                            className={`${styles.button} ${styles.cancelButton}`}
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <button
                        className={`${styles.button} ${styles.confirmButton}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
