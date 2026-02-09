'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, addMessage } from '@/app/actions/add-message';
import { getMessages } from '@/app/actions/get-messages';
import styles from './ListingMessages.module.css';

interface ListingMessagesProps {
    listingId: string;
    initialMessages: Message[];
}

export default function ListingMessages({ listingId, initialMessages }: ListingMessagesProps) {
    // Convert any Date strings back to Date objects if needed, though they might come as Dates or strings depending on serialization.
    // For safety, let's handle the initial state.
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [senderName, setSenderName] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial load from local storage if available for user name
    useEffect(() => {
        const storedName = localStorage.getItem('selleasy_username');
        if (storedName) {
            setSenderName(storedName);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!senderName.trim() || !content.trim()) {
            setError('Name and message are required.');
            setIsSubmitting(false);
            return;
        }

        const result = await addMessage({ listingId, senderName, content });

        if (result.success) {
            // Fetch updated messages to see AI response
            const refresh = await getMessages(listingId);

            if (refresh.success && refresh.data) {
                setMessages(refresh.data);
            } else {
                // Fallback optimistic update if refresh fails
                const newMessage: Message = {
                    id: result.id!,
                    listingId,
                    senderName,
                    content,
                    createdAt: Date.now()
                };
                setMessages(prev => [...prev, newMessage]);
            }

            setContent('');

            // Save name for next time
            localStorage.setItem('selleasy_username', senderName);
        } else {
            setError(typeof result.error === 'string' ? result.error : 'Failed to send message');
        }

        setIsSubmitting(false);
    };

    const formatDate = (date: Date | string | number) => {
        const d = new Date(date);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }).format(d);
    };

    return (
        <section className={styles.messagesContainer}>
            <h2 className={styles.title}>Q&A / Messages</h2>

            <div className={styles.messagesList}>
                {messages.length === 0 ? (
                    <div className={styles.emptyState}>
                        No messages yet. Be the first to ask!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={styles.messageCard}>
                            <div className={styles.messageHeader}>
                                <span className={styles.senderName}>{msg.senderName}</span>
                                <span className={styles.messageTime}>{formatDate(msg.createdAt)}</span>
                            </div>
                            <p className={styles.messageContent}>{msg.content}</p>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formTitle}>Ask a Question</div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label htmlFor="senderName" className={styles.label}>Your Name</label>
                    <input
                        id="senderName"
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className={styles.input}
                        placeholder="Enter your name"
                        disabled={isSubmitting}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="content" className={styles.label}>Message</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.textarea}
                        rows={3}
                        placeholder="Ask about quality, negotiate a price..."
                        disabled={isSubmitting}
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting || !content.trim() || !senderName.trim()}
                >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </section>
    );
}
