'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteListing } from '@/app/actions/delete-listing';
import styles from './DeleteListingButton.module.css';
import ConfirmationModal from './ConfirmationModal';

interface DeleteListingButtonProps {
    listingId: string;
    redirectAfterDelete?: boolean;
    iconOnly?: boolean;
}

export default function DeleteListingButton({ listingId, redirectAfterDelete = false, iconOnly = false }: DeleteListingButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        const result = await deleteListing(listingId);

        if (result.success) {
            setShowModal(false);
            if (redirectAfterDelete) {
                router.push('/listings');
                router.refresh(); // Ideally wait for this
            } else {
                router.refresh();
            }
        } else {
            alert('Failed to delete listing: ' + result.error);
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    return (
        <>
            <button
                onClick={handleDeleteClick}
                className={`${styles.deleteBtn} ${iconOnly ? styles.iconOnly : ''}`}
                disabled={isDeleting}
                aria-label="Delete"
                title="Delete"
            >
                {isDeleting ? (
                    iconOnly ? '...' : 'Deleting...'
                ) : (
                    <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        {!iconOnly && "Delete"}
                    </>
                )}
            </button>

            <ConfirmationModal
                isOpen={showModal}
                title="Delete Listing"
                message="Are you sure you want to delete this listing? This action cannot be undone."
                type="danger"
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setShowModal(false)}
                isLoading={isDeleting}
            />
        </>
    );
}
