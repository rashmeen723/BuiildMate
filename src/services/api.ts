import { Platform } from 'react-native';

// UPDATE THIS WITH YOUR COMPUTER'S IP ADDRESS
// Open CMD and type 'ipconfig', look for 'IPv4 Address'
const DEV_HUB_IP = '192.168.1.5'; // Example: 192.168.1.x

export const API_BASE_URL = Platform.select({
    ios: `http://${DEV_HUB_IP}:3000`,
    android: `http://${DEV_HUB_IP}:3000`,
    default: 'http://localhost:3000',
});

export const authApi = {
    register: async (data: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registration failed');
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Connection error');
        }
    },

    login: async (data: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Login failed');
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Connection error');
        }
    },
};
