import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const refreshProfile = async (currentToken = token) => {
        if (!currentToken) return;
        try {
            const res = await fetch('http://localhost:5001/api/settings', {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            const data = await res.json();
            const payload = JSON.parse(atob(currentToken.split('.')[1]));

            setUser({
                email: payload.userId,
                ...data, // Include Settings data (AvatarIndex, etc.)
                avatarIndex: Number(data.AvatarIndex) || 0 // Normalize property
            });
        } catch (err) {
            console.error("Failed to refresh profile", err);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                await refreshProfile(token);
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = (newToken, newUser) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        // refreshProfile will run via useEffect
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
