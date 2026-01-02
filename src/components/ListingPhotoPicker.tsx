'use client';

import { useState, useRef } from 'react';
import { analyzeImage } from '@/app/actions/analyze-image';
import styles from './ListingPhotoPicker.module.css';

export default function ListingPhotoPicker() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [description, setDescription] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setImageSrc(base64);
            setLoading(true);
            setDescription(''); // Clear previous description

            const mimeType = file.type;
            const result = await analyzeImage(base64, mimeType);

            if (result.success && result.description) {
                setDescription(result.description);
            } else {
                setDescription(result.error || "Failed to generate description.");
            }
            setLoading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.cameraButton}
                    disabled={loading}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 4H9.17157C9.70201 4 10.2107 3.78929 10.5858 3.41421L11.4142 2.58579C11.7893 2.21071 12.298 2 12.8284 2H17.1716C17.702 2 18.2107 2.21071 18.5858 2.58579L19.4142 3.41421C19.7893 3.78929 20.298 4 20.8284 4H21C22.6569 4 24 5.34315 24 7V17C24 18.6569 22.6569 20 21 20H3C1.34315 20 0 18.6569 0 17V7C0 5.34315 1.34315 4 3 4H7Z" fill="currentColor" opacity="0.8" />
                        <circle cx="12" cy="11" r="5" stroke="white" strokeWidth="2" />
                    </svg>
                    {imageSrc ? 'Retake Photo' : 'Take Photo'}
                </button>
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleCapture}
                    style={{ display: 'none' }}
                />
            </div>

            {imageSrc && (
                <div className={styles.previewContainer}>
                    <img src={imageSrc} alt="Captured listing item" className={styles.previewImage} />
                </div>
            )}

            {loading && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Analyzing image with Gemini...</p>
                </div>
            )}

            {description && !loading && (
                <div className={styles.descriptionContainer}>
                    <h3>Analysis Result</h3>
                    <p>{description}</p>
                </div>
            )}
        </div>
    );
}
