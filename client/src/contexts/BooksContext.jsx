import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const BooksContext = createContext();

export function BooksProvider({ children }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const fetchBooks = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/api/books', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch books');
            const data = await res.json();
            setBooks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    return (
        <BooksContext.Provider value={{ books, loading, error, fetchBooks }}>
            {children}
        </BooksContext.Provider>
    );
}

export function useBooks() {
    return useContext(BooksContext);
}
