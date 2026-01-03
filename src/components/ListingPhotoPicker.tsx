'use client';

import { useState, useRef, useEffect } from 'react';
import { analyzeImage } from '@/app/actions/analyze-image';
import styles from './ListingPhotoPicker.module.css';

export default function ListingPhotoPicker() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [description, setDescription] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

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
            setImageSrc(base64);
            setLoading(true);
            setDescription('');

            const mimeType = file.type;
            analyzePhoto(base64, mimeType);
        };
        reader.readAsDataURL(file);
    };

    const analyzePhoto = async (base64: string, mimeType: string) => {
        setLoading(true);
        // setDescription(''); needs to be separate if called from capturePhoto? keeping it consistent.

        const result = await analyzeImage(base64, mimeType);

        if (result.success && result.description) {
            setDescription(result.description);
        } else {
            setDescription(result.error || "Failed to generate description.");
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                {!isCameraOpen && (
                    <>
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
                            Upload / File
                        </button>

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
                            Use Webcam
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

            {description && !loading && !isCameraOpen && (
                <div className={styles.descriptionContainer}>
                    <h3>Analysis Result</h3>
                    <p>{description}</p>
                </div>
            )}
        </div>
    );
}
