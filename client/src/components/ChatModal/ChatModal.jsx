import { useState, useEffect, useRef } from 'react';
import styles from './ChatModal.module.scss';
import { chatApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function ChatModal({ book, onClose }) {
    const { token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const initialized = useRef(false);

    const storageKey = `chat_history_${book.EntityId}`;

    // Load history or init
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            setMessages(JSON.parse(stored));
        } else if (!initialized.current) {
            initialized.current = true;
            initChat();
        }
    }, []); // Only run once

    const initChat = async () => {
        setLoading(true);
        try {
            const data = await chatApi.sendMessage({
                title: book.Title,
                author: book.Author,
                isInit: true
            }, token);

            // Store hidden user message + visible model reply
            const userMsg = { role: 'user', text: data.userMessage, hidden: true };
            const botMsg = { role: 'model', text: data.reply };
            setMessages([userMsg, botMsg]);
        } catch (err) {
            console.error("Init chat error:", err);
            // Fallback if network fails
            setMessages([{ role: 'model', text: `Hello, I am ${book.Title}. Ask me anything!` }]);
        } finally {
            setLoading(false);
        }
    };

    // Save history
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
        scrollToBottom();
    }, [messages, storageKey]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Convert local messages to Gemini history format for context
            // Local: { role: 'user'/'model', text: '...' }
            // Gemini: { role: 'user'/'model', parts: [{ text: '...' }] }
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const data = await chatApi.sendMessage({
                title: book.Title,
                author: book.Author,
                userMessage: userMsg.text,
                history
            }, token);

            const botMsg = { role: 'model', text: data.reply };
            setMessages(prev => [...prev, botMsg]);

        } catch (err) {
            console.error("Chat error:", err);
            const errorMsg = { role: 'model', text: "I'm having trouble connecting right now. Please try again." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <header>
                    <h3>Chat with {book.Title}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </header>

                <div className={styles.messageList}>
                    {messages.filter(m => !m.hidden).map((msg, idx) => (
                        <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    ))}
                    {loading && <div className={styles.typing}>Typing...</div>}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.inputArea} onSubmit={handleSend}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()}>
                        <svg viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
