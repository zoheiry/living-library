import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './QuoteCard.module.scss';

export default function QuoteCard({ books = [] }) {
    const { token } = useAuth();
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiCallInProgress = useRef(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const defaultQuote = {
        text: "A room without books is like a body without a soul.",
        author: "Marcus Tullius Cicero",
        source: "Philosophy"
    };

    useEffect(() => {
        const loadExcerpt = async () => {
            if (!books || books.length === 0) {
                setQuote(defaultQuote);
                setLoading(false);
                return;
            }

            // 1. Check Local Storage
            const storedData = localStorage.getItem('daily_excerpt');
            const now = Date.now();
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;

            if (storedData) {
                const parsed = JSON.parse(storedData);
                // Check if less than 24 hours old
                if (now - parsed.timestamp < ONE_DAY_MS) {
                    setQuote(parsed);
                    setLoading(false);
                    return;
                }
            }

            // 2. Prevent race conditions/duplicate calls
            if (apiCallInProgress.current) return;
            apiCallInProgress.current = true;

            // 3. Generate new excerpt
            try {
                // Pick random book
                const randomBook = books[Math.floor(Math.random() * books.length)];

                const res = await fetch(`http://localhost:5001/api/excerpt/${encodeURIComponent(randomBook.EntityId)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error('Failed to fetch excerpt');

                const data = await res.json();

                const newQuote = {
                    text: data.excerpt,
                    author: randomBook.Author,
                    source: randomBook.Title,
                    timestamp: now
                };

                localStorage.setItem('daily_excerpt', JSON.stringify(newQuote));
                setQuote(newQuote);

            } catch (err) {
                console.error("Error fetching daily excerpt:", err);
                // Fallback to stored if available (even if old) or default
                if (storedData) {
                    setQuote(JSON.parse(storedData));
                } else {
                    setQuote(defaultQuote);
                }
            } finally {
                setLoading(false);
                apiCallInProgress.current = false;
            }
        };

        if (token) {
            loadExcerpt();
        }
    }, [books, token]);

    if (loading) {
        return (
            <div className={styles.quoteCard} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p>Finding a gem for you...</p>
            </div>
        );
    }



    return (
        <div className={styles.quoteCard} onClick={toggleExpand}> {/* Allowing click anywhere on card for ease */}
            <span className={`${styles.quoteIcon} ${styles.left}`}>“</span>
            <blockquote>
                <p className={isExpanded ? styles.expanded : styles.collapsed}>
                    {quote.text}
                </p>
                <footer>
                    — {quote.author}, <cite>{quote.source}</cite>
                </footer>
            </blockquote>
            <span className={`${styles.quoteIcon} ${styles.right}`}>”</span>
        </div>
    );
}
