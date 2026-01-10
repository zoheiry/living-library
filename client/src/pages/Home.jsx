import { useState } from 'react';
import { useBooks } from '../contexts/BooksContext';
import { useAuth } from '../contexts/AuthContext';
import Hero from '../components/Hero/Hero';
import QuoteCard from '../components/QuoteCard/QuoteCard';
import BookList from '../components/BookList/BookList';

export default function Home() {
    const { books, loading, error } = useBooks();
    const { token } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const handleTestEmail = async () => {
        if (!confirm('Send test email now?')) return;
        try {
            const res = await fetch('http://localhost:5001/api/settings/trigger-email', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            alert(data.message || 'Email triggered!');
        } catch (err) {
            console.error(err);
            alert('Failed to trigger email');
        }
    };

    if (loading && books.length === 0) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // Filter books based on search term
    const filteredBooks = books.filter(book =>
        book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.Author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <Hero />

            <QuoteCard books={books} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <input
                    type="text"
                    placeholder="Search title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #1e293b', // Surface color
                        width: '100%',
                        maxWidth: '400px',
                        background: '#1e293b',
                        color: 'white'
                    }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Add Filter buttons here later if needed */}
                </div>
            </div>

            {books.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <p>No books added yet. Click "Add New Book" to get started!</p>
                </div>
            ) : filteredBooks.length === 0 ? (
                <p>No books found matching "{searchTerm}"</p>
            ) : (
                <BookList books={filteredBooks} />
            )}
        </div>
    );
}
