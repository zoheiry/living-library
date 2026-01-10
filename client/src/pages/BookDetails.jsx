import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooks } from '../contexts/BooksContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/BookDetails.scss';

export default function BookDetails() {
    const { id } = useParams(); // entityId
    const { books, fetchBooks } = useBooks();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [notes, setNotes] = useState('');
    const [editYear, setEditYear] = useState('');

    // Separate edit states
    const [isEditingYear, setIsEditingYear] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    const [loading, setLoading] = useState(true);

    const [excerpt, setExcerpt] = useState('');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (!token) return;

        const foundBook = books.find(b => b.EntityId === id);
        if (foundBook) {
            setBook(foundBook);
            setNotes(foundBook.Notes || '');
            setEditYear(foundBook.DateRead || '');
            setLoading(false);
        } else {
            fetch(`http://localhost:5001/api/books/${encodeURIComponent(id)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Book not found');
                    return res.json();
                })
                .then(data => {
                    setBook(data);
                    setNotes(data.Notes || '');
                    setEditYear(data.DateRead || '');
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [id, books, token]);

    const handleSaveYear = async () => {
        try {
            const res = await fetch(`http://localhost:5001/api/books/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ dateRead: editYear })
            });
            if (res.ok) {
                const updatedBook = await res.json();
                setBook(updatedBook);
                setEditYear(updatedBook.DateRead || editYear);
                setIsEditingYear(false);
                fetchBooks();
            }
        } catch (err) {
            console.error("Failed to save year", err);
        }
    };

    const handleSaveNotes = async () => {
        try {
            const res = await fetch(`http://localhost:5001/api/books/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ notes })
            });
            if (res.ok) {
                const updatedBook = await res.json();
                setBook(updatedBook);
                setNotes(updatedBook.Notes || '');
                setIsEditingNotes(false);
                fetchBooks();
            }
        } catch (err) {
            console.error("Failed to save notes", err);
        }
    };

    const handleDeleteBook = async () => {
        if (!confirm("Are you sure you want to delete this book? This cannot be undone.")) return;

        try {
            const res = await fetch(`http://localhost:5001/api/books/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchBooks();
                navigate('/');
            }
        } catch (err) {
            console.error("Failed to delete book", err);
        }
    };

    const handleGenerateExcerpt = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`http://localhost:5001/api/excerpt/${encodeURIComponent(id)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.excerpt) {
                setExcerpt(data.excerpt);
            }
        } catch (err) {
            console.error("Failed to generate", err);
        }
        setGenerating(false);
    };

    if (loading) return <div>Loading...</div>;
    if (!book) return <div>Book not found</div>;

    return (
        <div className="book-details-page">
            <button onClick={() => navigate('/')} className="back-btn">
                &larr; Back to Bookshelf
            </button>

            <div className="content-wrapper">
                <div className="cover-section">
                    {book.CoverImage && (
                        <img src={book.CoverImage} alt={book.Title} />
                    )}
                </div>

                <div className="info-section">
                    <div className="title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h1>{book.Title}</h1>
                        <button onClick={handleDeleteBook} className="delete-btn" style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete Book</button>
                    </div>

                    <h3>{book.Author}</h3>

                    {isEditingYear ? (
                        <div className="edit-year-section">
                            <label>Year Finished:</label>
                            <input
                                type="number"
                                value={editYear}
                                onChange={e => setEditYear(e.target.value)}
                                className="year-input"
                            />
                            <button onClick={handleSaveYear} className="save-btn">Save</button>
                            <button onClick={() => { setIsEditingYear(false); setEditYear(book.DateRead || ''); }} className="cancel-btn">Cancel</button>
                        </div>
                    ) : (
                        <div className="date-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <p className="date" style={{ marginBottom: 0 }}>Finished in: {book.DateRead || 'Unknown'}</p>
                            <button onClick={() => setIsEditingYear(true)} className="edit-btn" style={{ color: '#8b5cf6', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.9rem' }}>Edit Year</button>
                        </div>
                    )}

                    <div className="notes-section">
                        <header>
                            <h2>My Notes</h2>
                            {!isEditingNotes && (
                                <button onClick={() => setIsEditingNotes(true)} className="edit-btn">Edit Notes</button>
                            )}
                        </header>

                        {isEditingNotes ? (
                            <div>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Add your thoughts..."
                                    style={{ width: '100%', minHeight: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white', marginBottom: '10px' }}
                                />
                                <div className="actions">
                                    <button onClick={handleSaveNotes} className="save-btn">Save Notes</button>
                                    <button onClick={() => { setIsEditingNotes(false); setNotes(book.Notes || ''); }} className="cancel-btn">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="notes-display">
                                {notes || <em style={{ color: '#666' }}>No notes yet...</em>}
                            </div>
                        )}
                    </div>

                    <div className="excerpt-section">
                        <h2>Daily Excerpt</h2>
                        <p>
                            {excerpt ? excerpt : "AI-generated excerpt will appear here."}
                        </p>
                        <button
                            onClick={handleGenerateExcerpt}
                            disabled={generating}
                            className="generate-btn"
                        >
                            {generating ? 'Generating...' : 'Generate New Excerpt'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
