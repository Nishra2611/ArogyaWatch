import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, googleAuth } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('AuthProvider: Starting initialization...');
        // Check for token on initial load
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Failed to parse user data from storage', err);
                logout();
            }
        }
        console.log('AuthProvider: Initialization complete, setting loading to false.');
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const data = await loginUser({ username, password });

            // Assuming your backend returns { token: '...', user: { id: 1, role: 'ADMIN', associated_phc_id: null } }
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const data = await registerUser(userData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error("Registration failed:", error);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const loginWithGoogle = async (googleData) => {
        try {
            const data = await googleAuth(googleData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error("Google Auth failed:", error);
            return { success: false, message: error.response?.data?.message || 'Google Auth failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
