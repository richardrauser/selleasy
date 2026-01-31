'use client';

import { useState } from 'react';
import Link from "next/link";
import styles from '@/app/listings/[id]/page.module.css'; // Reusing page styles for consistency
import DeleteListingButton from "@/components/DeleteListingButton";
import { updateListing } from '@/app/actions/update-listing';
import ConfirmationModal from './ConfirmationModal';
import { Listing } from '@/app/actions/get-listings';

// Since we are reusing styles from a module that might not be in the same directory, 
// we initially should probably just import the same CSS module or duplicate/refactor. 
// For now, I'll assume the import path I used above works if I'm allowed to import from app/ 
// or I'll use a new module. Let's create a new module to be safe but copy styles if needed.
// Actually, importing from app is fine in Next.js usually.

interface ListingDetailsProps {
    listing: Listing;
}

export default function ListingDetails({ listing }: ListingDetailsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: listing.title,
        description: listing.description,
        quality: listing.quality,
        chosenPrice: listing.chosenPrice
    });

    const [showSaveModal, setShowSaveModal] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = () => {
        setShowSaveModal(true);
    };

    const confirmSave = async () => {
        setIsSaving(true);
        const result = await updateListing({
            id: listing.id,
            ...formData
        });

        if (result.success) {
            setIsEditing(false);
            setShowSaveModal(false);
        } else {
            alert("Failed to update listing: " + result.error);
        }
        setIsSaving(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            title: listing.title,
            description: listing.description,
            quality: listing.quality,
            chosenPrice: listing.chosenPrice
        });
    };

    return (
        <article className={styles.detailsCard}>
            {listing.imageBase64 && (
                <div className={styles.imageContainer}>
                    <img src={listing.imageBase64} alt={listing.title} className={styles.listingImage} />
                </div>
            )}

            <header className={styles.header}>
                {isEditing ? (
                    <div className={styles.editHeader}>
                        <label className={styles.label}>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={styles.titleInput}
                        />
                    </div>
                ) : (
                    <div className={styles.headerTop}>
                        <h1 className={styles.title}>{listing.title}</h1>
                    </div>
                )}

                <div className={styles.meta}>
                    {isEditing ? (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Quality</label>
                            <select
                                name="quality"
                                value={formData.quality}
                                onChange={handleInputChange}
                                className={styles.qualityInput}
                            >
                                <option value="New">New</option>
                                <option value="Like New">Like New</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>
                    ) : (
                        <span className={styles.qualityBadge}>{listing.quality}</span>
                    )}

                </div>
            </header>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Description</h3>
                {isEditing ? (
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className={styles.descriptionInput}
                        rows={5}
                    />
                ) : (
                    <p className={styles.description}>{listing.description}</p>
                )}
            </div>

            <div className={styles.priceGrid}>
                <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Suggested Price</span>
                    <span className={`${styles.priceValue} ${styles.suggested}`}>
                        ${listing.suggestedPrice}
                    </span>
                </div>

                <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Price</span>
                    {isEditing ? (
                        <input
                            type="number"
                            name="chosenPrice"
                            value={formData.chosenPrice}
                            onChange={handleInputChange}
                            className={styles.priceInput}
                            step="0.01"
                        />
                    ) : (
                        <span className={styles.priceValue}>${listing.chosenPrice}</span>
                    )}
                </div>
            </div>

            {
                isEditing ? (
                    <div className={styles.editActions}>
                        <button
                            onClick={handleCancel}
                            className={styles.cancelBtn}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveClick}
                            className={styles.saveBtn}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ) : (
                    <div className={styles.footerActions}>
                        <Link href={`/listings/${listing.id}/buy`} className={styles.buyBtn}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            Buy now!
                        </Link>
                        <div className={styles.actionGroup}>
                            <button
                                onClick={() => setIsEditing(true)}
                                className={styles.editBtn}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit
                            </button>
                            <DeleteListingButton listingId={listing.id} redirectAfterDelete={true} />
                        </div>
                    </div>
                )
            }

            <ConfirmationModal
                isOpen={showSaveModal}
                title="Save Changes"
                message="Are you sure you want to save these changes?"
                type="info"
                confirmLabel="Save"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveModal(false)}
                isLoading={isSaving}
            />
        </article >
    );
}
