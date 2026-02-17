import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isEmailVerified: boolean;
    phone?: string;
    profileImage?: string | null;
    addresses?: any[];
}

interface AuthContextData {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (userData: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load stored auth data on app start
        const loadAuthData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('@BuildMate:user');
                const storedToken = await AsyncStorage.getItem('@BuildMate:token');

                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                }
            } catch (error) {
                console.error('Error loading auth data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAuthData();
    }, []);

    const login = async (userData: User, authToken: string) => {
        try {
            setUser(userData);
            setToken(authToken);
            await AsyncStorage.setItem('@BuildMate:user', JSON.stringify(userData));
            await AsyncStorage.setItem('@BuildMate:token', authToken);
        } catch (error) {
            console.error('Error saving auth data:', error);
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            setToken(null);
            await AsyncStorage.removeItem('@BuildMate:user');
            await AsyncStorage.removeItem('@BuildMate:token');
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
