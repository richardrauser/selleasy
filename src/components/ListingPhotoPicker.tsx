'use client';

import { useState, useRef, useEffect } from 'react';
import { analyzeImage } from '@/app/actions/analyze-image';
import { suggestPriceFromDescription } from '@/app/actions/suggest-price';
import { createListing } from '@/app/actions/create-listing';
import styles from './ListingPhotoPicker.module.css';
import ConfirmationModal from './ConfirmationModal';

export default function ListingPhotoPicker() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [description, setDescription] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [showAllItems, setShowAllItems] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // New state for editable fields
    const [localTitle, setLocalTitle] = useState<string>('');
    const [localDescription, setLocalDescription] = useState<string>('');
    const [localQuality, setLocalQuality] = useState<string>('');

    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    const [tempTitle, setTempTitle] = useState<string>('');
    const [tempDescription, setTempDescription] = useState<string>('');
    const [tempQuality, setTempQuality] = useState<string>('');



    const [chosenPrice, setChosenPrice] = useState<string>('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [croppedImageSrc, setCroppedImageSrc] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Stop camera stream when component unmounts or camera closes
    useEffect(() => {
        return () => {
            stopCameraStream();
        };
    }, []);

    const stopCameraStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const startCamera = async () => {
        setCameraError(null);
        setImageSrc(null);
        setDescription('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera on mobile
            });
            setIsCameraOpen(true);

            // Wait for state update to render video element
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);

        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraError("Could not access camera. Please check permissions or use Upload.");
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64 = canvas.toDataURL('image/jpeg');

                setImageSrc(base64);
                setIsCameraOpen(false);
                stopCameraStream();

                analyzePhoto(base64, 'image/jpeg');
            }
        }
    };

    const closeCamera = () => {
        setIsCameraOpen(false);
        stopCameraStream();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;

            // Replicate actions from capturePhoto
            setImageSrc(base64);
            setIsCameraOpen(false);
            stopCameraStream();

            setLoading(true);
            setDescription('');

            const mimeType = file.type;
            analyzePhoto(base64, mimeType);
        };
        reader.readAsDataURL(file);
    };

    const analyzePhoto = async (base64: string, mimeType: string) => {
        setLoading(true);
        setItems([]);
        setSelectedItemId(null);

        const result = await analyzeImage(base64, mimeType);

        if (result.success && result.data) {
            setItems(result.data.items || []);

            // Auto-select the first item if available
            if (result.data.items && result.data.items.length > 0) {
                setSelectedItemId(result.data.items[0].id);
            }
        } else {
            console.error(result.error || "Failed to analyze image.");
            // Optionally set an error state here
        }
        setLoading(false);
    };

    const handleItemSelect = (itemId: string) => {
        setSelectedItemId(itemId);
        // Ideally we might want to re-focus the description on this specific item, 
        // but for this iteration we'll just track the selection. 
        // In a real app we might re-prompt Gemini to describe THIS specific item if the initial description was generic, 
        // or if the initial listingDetails object only covered the top item.
        // For now, let's assume the user just wants to tag it.
    };

    // Sync local state when selected item changes
    useEffect(() => {
        const item = items.find(i => i.id === selectedItemId);
        if (item) {
            setLocalTitle(item.title || '');
            setLocalDescription(item.description || '');
            setLocalQuality(item.quality || 'Good'); // Default to 'Good' if undefined

            setTempTitle(item.title || '');
            setTempDescription(item.description || '');
            setTempQuality(item.quality || 'Good');
        }
    }, [selectedItemId, items]);

    const selectedItem = items.find(item => item.id === selectedItemId);

    const handleEditClick = () => {
        setTempTitle(localTitle);
        setTempDescription(localDescription);
        setTempQuality(localQuality);
        setIsEditingDescription(true);
    };

    const handleCancelEdit = () => {
        setTempTitle(localTitle);
        setTempDescription(localDescription);
        setTempQuality(localQuality);
        setIsEditingDescription(false);
    };

    const handleSaveEdit = async () => {
        setLocalTitle(tempTitle);
        setLocalDescription(tempDescription);
        setLocalQuality(tempQuality);
        setIsEditingDescription(false);

        // Update price based on new details
        if (!selectedItemId) return;

        setIsUpdatingPrice(true);
        const result = await suggestPriceFromDescription(tempTitle, tempDescription, tempQuality);

        if (result.success && result.data?.suggestedPrice) {
            setItems(prevItems => prevItems.map(item =>
                item.id === selectedItemId
                    ? {
                        ...item,
                        title: tempTitle,
                        description: tempDescription,
                        quality: tempQuality,
                        suggestedPrice: result.data.suggestedPrice
                    }
                    : item
            ));
        } else {
            console.error(result.error || "Failed to update price");
            // Optionally handle error in UI
            // Still update the local fields in the item even if price fetch fails, 
            // otherwise the UI will revert on next render if we only rely on item state.
            setItems(prevItems => prevItems.map(item =>
                item.id === selectedItemId
                    ? {
                        ...item,
                        title: tempTitle,
                        description: tempDescription,
                        quality: tempQuality
                    }
                    : item
            ));
        }
        setIsUpdatingPrice(false);
    };

    // Calculate default chosen price when suggested price changes
    useEffect(() => {
        if (selectedItem?.suggestedPrice) {
            const priceStr = selectedItem.suggestedPrice;
            // Extract all numbers (including decimals)
            const matches = priceStr.match(/(\d+\.?\d*)/g);

            if (matches && matches.length > 0) {
                const prices = matches.map(Number);
                let defaultPrice = '';

                if (prices.length >= 2) {
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    const avg = (min + max) / 2;
                    // Format to generic number string, try to keep it clean (e.g. 125, not 125.00 if unnecessary, but 125.50 if needed)
                    defaultPrice = avg % 1 === 0 ? avg.toString() : avg.toFixed(2);
                } else if (prices.length === 1) {
                    defaultPrice = prices[0].toString();
                }

                setChosenPrice(defaultPrice);
            } else {
                setChosenPrice('');
            }
        }
    }, [selectedItem?.suggestedPrice]);

    useEffect(() => {
        const item = items.find(i => i.id === selectedItemId);
        if (item && item.boundingBox && imageSrc) {
            generateCroppedImage(imageSrc, item.boundingBox);
        } else {
            setCroppedImageSrc(null);
        }
    }, [selectedItemId, items, imageSrc]);

    const generateCroppedImage = (base64: string, box: number[]) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const [ymin, xmin, ymax, xmax] = box;

            const startX = xmin * img.width;
            const startY = ymin * img.height;
            const width = (xmax - xmin) * img.width;
            const height = (ymax - ymin) * img.height;

            if (width <= 0 || height <= 0) return;

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
                ctx.drawImage(img, startX, startY, width, height, 0, 0, width, height);
                setCroppedImageSrc(canvas.toDataURL());
            }
        };
        img.src = base64;
    };

    const handlePublish = async () => {
        if (!selectedItemId) return;

        setIsPublishing(true);
        const thisItem = items.find(i => i.id === selectedItemId);

        if (!thisItem) {
            setIsPublishing(false);
            return;
        }

        const result = await createListing({
            title: localTitle,
            description: localDescription,
            quality: localQuality,
            suggestedPrice: thisItem.suggestedPrice || '',
            chosenPrice: chosenPrice,
            imageBase64: croppedImageSrc || undefined
        });

        if (result.success) {
            setShowSuccessModal(true);
        } else {
            alert("Failed to publish listing: " + (result.error || "Unknown error"));
        }
        setIsPublishing(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                {!isCameraOpen && (
                    <>
                        <button
                            type="button"
                            onClick={startCamera}
                            className={styles.webcamButton}
                            disabled={loading}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23 19V5C23 3.89543 22.1046 3 21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19Z" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                            </svg>
                            Take Photo
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={styles.cameraButton}
                            disabled={loading}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 16L8.586 11.414C8.96106 11.0391 9.5691 11.0391 9.94404 11.414L16 17.5M14 13.5L14.586 12.914C14.9611 12.5391 15.5691 12.5391 15.944 12.914L20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Upload File
                        </button>

                    </>
                )}

                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>

            {cameraError && <p style={{ color: 'red', textAlign: 'center' }}>{cameraError}</p>}

            {isCameraOpen ? (
                <div className={styles.previewContainer}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={styles.videoFeed}
                    />
                    <div className={styles.cameraOverlay}>
                        <button type="button" onClick={closeCamera} className={styles.cancelBtn}>Cancel</button>
                        <button type="button" onClick={capturePhoto} className={styles.captureBtn}>Capture Photo</button>
                    </div>
                </div>
            ) : (
                imageSrc && (
                    <div className={styles.previewContainer}>
                        <img src={imageSrc} alt="Captured listing item" className={styles.previewImage} />
                    </div>
                )
            )}

            {/* Hidden canvas for capturing the frame */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {loading && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Analyzing image with Gemini...</p>
                </div>
            )}

            {items.length > 0 && !loading && !isCameraOpen && (
                <div className={styles.itemSelectionContainer}>
                    <h3 className={styles.selectionTitle}>The item I wish to sell is:</h3>
                    <div className={styles.itemGraph}>
                        {items.slice(0, showAllItems ? undefined : 3).map((item) => (
                            <label
                                key={item.id}
                                className={`${styles.itemOption} ${selectedItemId === item.id ? styles.selected : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="selectedItem"
                                    value={item.id}
                                    checked={selectedItemId === item.id}
                                    onChange={() => handleItemSelect(item.id)}
                                />
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.confidenceScore}>
                                    {(item.confidence * 100).toFixed(0)}% Match
                                </span>
                            </label>
                        ))}
                    </div>
                    {items.length > 3 && (
                        <button
                            type="button"
                            onClick={() => setShowAllItems(!showAllItems)}
                            className={styles.showMoreBtn}
                            aria-label={showAllItems ? "Show less items" : "Show more items"}
                        >
                            {showAllItems ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            )}

            {selectedItem && !loading && !isCameraOpen && (
                <div className={styles.descriptionContainer}>
                    <div className={styles.descriptionContainer}>
                        {croppedImageSrc && (
                            <div className={styles.croppedImageContainer}>
                                <span className={styles.croppedImageLabel}>Selected Item</span>
                                <img src={croppedImageSrc} alt="Selected item crop" className={styles.croppedImage} />
                            </div>
                        )}
                        {isEditingDescription ? (
                            <div className={styles.editForm}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                                        Item
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.titleInput}
                                        value={tempTitle}
                                        onChange={(e) => setTempTitle(e.target.value)}
                                        placeholder="Item name/title"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        Description
                                    </label>
                                    <textarea
                                        className={styles.descriptionInput}
                                        value={tempDescription}
                                        onChange={(e) => setTempDescription(e.target.value)}
                                        placeholder="Enter item description..."
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        Quality
                                    </label>
                                    <select
                                        className={styles.qualityInput}
                                        value={tempQuality}
                                        onChange={(e) => setTempQuality(e.target.value)}
                                    >
                                        <option value="New">New</option>
                                        <option value="Like New">Like New</option>
                                        <option value="Excellent">Excellent</option>
                                        <option value="Good">Good</option>
                                        <option value="Fair">Fair</option>
                                        <option value="Poor">Poor</option>
                                    </select>
                                </div>

                                <div className={styles.actionButtons}>
                                    <button
                                        className={styles.cancelBtnEdit}
                                        onClick={handleCancelEdit}
                                        disabled={isUpdatingPrice}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.saveBtn}
                                        onClick={handleSaveEdit}
                                        disabled={isUpdatingPrice}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.readOnlyContent}>
                                <div className={styles.readOnlyField}>
                                    <span className={styles.label}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                                        Item
                                    </span>
                                    <h3 className={styles.itemTitle}>{localTitle}</h3>
                                </div>

                                <div className={styles.readOnlyField}>
                                    <span className={styles.label}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        Description
                                    </span>
                                    <p className={styles.descriptionParagraph}>{localDescription}</p>
                                </div>

                                <div className={styles.readOnlyField}>
                                    <span className={styles.label}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        Quality
                                    </span>
                                    <p className={styles.qualityValue}>{localQuality}</p>
                                </div>

                                <button
                                    className={styles.editButton}
                                    onClick={handleEditClick}
                                    aria-label="Edit description"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M18.5 2.50001C18.8978 2.10218 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10218 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 4.89784 21.5 5.29567L12 14.7957L8 16L9.2043 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedItem && selectedItem.suggestedPrice && !loading && !isCameraOpen && (
                <div className={styles.suggestedPriceContainer}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Suggested resale price: {isUpdatingPrice ? (
                        <span className={styles.priceLoader}></span>
                    ) : (
                        selectedItem.suggestedPrice
                    )}
                </div>
            )}

            {selectedItem && selectedItem.suggestedPrice && !loading && !isCameraOpen && (
                <div className={styles.chosenPriceContainer}>
                    <label className={styles.chosenPriceLabel}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        Your chosen sale price
                    </label>
                    <input
                        type="number"
                        className={styles.chosenPriceInput}
                        value={chosenPrice}
                        onChange={(e) => setChosenPrice(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                    />

                    <button
                        className={styles.publishBtn}
                        onClick={handlePublish}
                        disabled={isPublishing || isUpdatingPrice}
                    >
                        {isPublishing ? 'Publishing...' : 'Publish Listing'}
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={showSuccessModal}
                title="Listing Published!"
                message="Your listing has been successfully published."
                type="success"
                confirmLabel="View Listings"
                cancelLabel="Create Another"
                onConfirm={() => {
                    // Redirect to listings page
                    window.location.href = '/listings';
                }}
                onCancel={() => {
                    // Reset to add another (reload the page to clear state efficiently or reset manually)
                    window.location.reload();
                }}
            />
        </div>
    );
}
