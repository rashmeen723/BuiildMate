import { Platform } from 'react-native';

// UPDATE THIS WITH YOUR COMPUTER'S IP ADDRESS
// Open CMD and type 'ipconfig', look for 'IPv4 Address'
const DEV_HUB_IP = '192.168.43.101'; // Your Wi-Fi IP

export const API_BASE_URL = Platform.select({
    ios: `http://${DEV_HUB_IP}:3000`,
    android: `http://${DEV_HUB_IP}:3000`,
    default: 'http://localhost:3000',
});

export const authApi = {
    register: async (data: any) => {
        try {
            console.log('Sending registration data to:', `${API_BASE_URL}/auth/register`);
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                // Check if result.message is an array (NestJS validation error)
                const errorMessage = Array.isArray(result.message)
                    ? result.message.join(', ')
                    : result.message || 'Registration failed';
                throw new Error(errorMessage);
            }

            return result;
        } catch (error: any) {
            console.error('Registration API Error:', error);
            throw new Error(error.message || 'Connection to server failed. Please check your internet connection.');
        }
    },

    login: async (data: any) => {
        try {
            console.log('Sending login data to:', `${API_BASE_URL}/auth/login`);
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
            console.error('Login API Error:', error);
            throw new Error(error.message || 'Connection to server failed. Please check your internet connection.');
        }
    },

    sendOtp: async (email: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to send verification code');
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Connection error');
        }
    },

    verifyOtp: async (email: string, code: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Invalid verification code');
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Connection error');
        }
    },

    getProfile: async (token: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch profile');
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Connection error');
        }
    },

    updateProfile: async (token: string, data: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update profile');
            }

            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Connection error');
        }
    },

    uploadProfileImage: async (token: string, uri: string) => {
        try {
            const formData = new FormData();

            // Construct file name and type
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image`;

            // @ts-ignore
            formData.append('image', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: filename,
                type: type,
            });

            const response = await fetch(`${API_BASE_URL}/auth/profile/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to upload image');
            }

            return result;
        } catch (error: any) {
            console.error('Image upload error:', error);
            throw new Error(error.message || 'Image upload failed');
        }
    },
    uploadPublicFile: async (uri: string) => {
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop() || 'file';
            const match = /\.(\w+)$/.exec(filename);
            const ext = match ? match[1].toLowerCase() : '';

            let type = '';
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            } else if (ext === 'pdf') {
                type = 'application/pdf';
            } else {
                type = 'application/octet-stream';
            }

            // @ts-ignore
            formData.append('file', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: filename,
                type: type,
            });

            const response = await fetch(`${API_BASE_URL}/auth/upload-public`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Upload failed');
            return result.imageUrl;
        } catch (error: any) {
            console.error('Public upload error:', error);
            throw new Error(error.message || 'Upload failed');
        }
    }
};

