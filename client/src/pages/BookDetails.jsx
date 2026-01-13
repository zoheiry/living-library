import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooks } from '../contexts/BooksContext';
import { useAuth } from '../contexts/AuthContext';
import { booksApi, excerptApi } from '../api';
import '../styles/pages/BookDetails.scss';
import ChatModal from '../components/ChatModal/ChatModal';

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
    const [isChatOpen, setIsChatOpen] = useState(false);

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
            booksApi.getById(id, token)
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
            const updatedBook = await booksApi.update(id, { dateRead: editYear }, token);
            setBook(updatedBook);
            setEditYear(updatedBook.DateRead || editYear);
            setIsEditingYear(false);
            fetchBooks();
        } catch (err) {
            console.error("Failed to save year", err);
        }
    };

    const handleSaveNotes = async () => {
        try {
            const updatedBook = await booksApi.update(id, { notes }, token);
            setBook(updatedBook);
            setNotes(updatedBook.Notes || '');
            setIsEditingNotes(false);
            fetchBooks();
        } catch (err) {
            console.error("Failed to save notes", err);
        }
    };

    const handleDeleteBook = async () => {
        if (!confirm("Are you sure you want to delete this book? This cannot be undone.")) return;

        try {
            await booksApi.delete(id, token);
            fetchBooks();
            navigate('/');
        } catch (err) {
            console.error("Failed to delete book", err);
        }
    };

    const handleGenerateExcerpt = async () => {
        setGenerating(true);
        try {
            const data = await excerptApi.generate(id, token);
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
                    <div className="title-row">
                        <h1>{book.Title}</h1>
                        <button onClick={handleDeleteBook} className="delete-btn">Delete Book</button>
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
                        <div className="date-row">
                            <p className="date">Finished in: {book.DateRead || 'Unknown'}</p>
                            <button onClick={() => setIsEditingYear(true)} className="edit-year-btn">Edit Year</button>
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
                                    className="notes-input"
                                />
                                <div className="actions">
                                    <button onClick={handleSaveNotes} className="save-btn">Save Notes</button>
                                    <button onClick={() => { setIsEditingNotes(false); setNotes(book.Notes || ''); }} className="cancel-btn">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="notes-display">
                                {notes || <em className="empty-notes">No notes yet...</em>}
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

                    <button className="chat-btn" onClick={() => setIsChatOpen(true)}>
                        Chat with Book
                    </button>

                </div>
            </div>

            {isChatOpen && (
                <ChatModal
                    book={book}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </div>
    );
}
