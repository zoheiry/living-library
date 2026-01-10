import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './BookSearch.module.scss';

export default function BookSearch({ onBookAdded, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [dateRead, setDateRead] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useAuth(); // Get token

    const searchBooks = async (e) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data.items || []);
        } catch (err) {
            console.error("Search failed", err);
        }
        setLoading(false);
    };

    const verifyBook = (book) => {
        const info = book.volumeInfo;
        setSelectedBook({
            title: info.title,
            author: info.authors ? info.authors.join(', ') : 'Unknown',
            coverImage: info.imageLinks?.thumbnail || '',
            externalId: book.id,
            notes: ''
        });
        setResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBook || !dateRead) return;

        const bookToSave = { ...selectedBook, dateRead };

        try {
            const res = await fetch('http://localhost:5001/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Add Header
                },
                body: JSON.stringify(bookToSave)
            });
            if (res.ok) {
                onBookAdded();
                onClose();
            }
        } catch (err) {
            console.error("Failed to save book", err);
        }
    };

    if (selectedBook) {
        return (
            <form onSubmit={handleSubmit} className={styles.confirmForm}>
                <div className={styles.bookPreview}>
                    {selectedBook.coverImage && <img src={selectedBook.coverImage} alt="Cover" />}
                    <div>
                        <p><strong>{selectedBook.title}</strong></p>
                        <p>{selectedBook.author}</p>
                    </div>
                </div>
                <label>
                    Year Finished:
                    <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={dateRead}
                        onChange={e => setDateRead(e.target.value)}
                        placeholder="YYYY"
                        required
                    />
                </label>
                <button type="submit" className={styles.addButton}>Add Book</button>
                <button type="button" onClick={() => setSelectedBook(null)} className={styles.backButton}>Back to Search</button>
            </form>
        );
    }

    return (
        <div>
            <form onSubmit={searchBooks} className={styles.searchForm}>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search for a book..."
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className={styles.resultsList}>
                {results.map(book => (
                    <div
                        key={book.id}
                        onClick={() => verifyBook(book)}
                        className={styles.resultItem}
                    >
                        {book.volumeInfo.imageLinks?.smallThumbnail && (
                            <img src={book.volumeInfo.imageLinks.smallThumbnail} alt="" />
                        )}
                        <div className={styles.bookInfo}>
                            <div className={styles.title}>{book.volumeInfo.title}</div>
                            <div className={styles.authors}>{book.volumeInfo.authors?.join(', ')}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
