import { Platform } from 'react-native';

// UPDATE THIS WITH YOUR COMPUTER'S IP ADDRESS
// Open CMD and type 'ipconfig', look for 'IPv4 Address'
const DEV_HUB_IP = '192.168.43.101'; // Your Wi-Fi IP

export const API_BASE_URL = Platform.select({
    ios: `http://${DEV_HUB_IP}:5000`,
    android: `http://${DEV_HUB_IP}:5000`,
    default: 'http://localhost:5000',
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
    },
    getNearbyProviders: async (lat: number, lng: number, category?: string, date?: string, time?: string) => {
        try {
            let url = `${API_BASE_URL}/services/nearby?lat=${lat}&lng=${lng}`;
            if (category) url += `&category=${category}`;
            if (date) url += `&date=${date}`;
            if (time) url += `&time=${time}`;

            const response = await fetch(url);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch nearby providers');
            return result;
        } catch (error: any) {
            console.error('Fetch Nearby Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getProviderDetails: async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/provider/${id}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch provider details');
            return result;
        } catch (error: any) {
            console.error('Fetch Provider Details Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getProviderAvailability: async (id: string, date: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/provider/${id}/availability?date=${date}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch availability');
            return result;
        } catch (error: any) {
            console.error('Fetch Availability Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    createBooking: async (bookingData: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create booking');
            return result;
        } catch (error: any) {
            console.error('Create Booking Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getUserBookings: async (userId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/user/${userId}/bookings`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch bookings');
            return result;
        } catch (error: any) {
            console.error('Fetch Bookings Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getProviderReviews: async (providerId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/provider/${providerId}/reviews`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch reviews');
            return result;
        } catch (error: any) {
            console.error('Fetch Reviews Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getUserReviews: async (userId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/user/${userId}/reviews`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch reviews');
            return result;
        } catch (error: any) {
            console.error('Fetch User Reviews Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    createReview: async (reviewData: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to submit review');
            return result;
        } catch (error: any) {
            console.error('Submit Review Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getProviderBookings: async (providerId: string, date?: string) => {
        try {
            const url = date
                ? `${API_BASE_URL}/services/provider/${providerId}/bookings?date=${date}`
                : `${API_BASE_URL}/services/provider/${providerId}/bookings`;
            const response = await fetch(url);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch provider bookings');
            return result;
        } catch (error: any) {
            console.error('Fetch Provider Bookings Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    updateBookingStatus: async (bookingId: string, status: string, additionalCharges?: number, reason?: string, cancelledBy?: string) => {
        try {
            const bodyData: any = { bookingId, status };
            if (additionalCharges !== undefined) {
                bodyData.additionalCharges = additionalCharges;
            }
            if (reason !== undefined) {
                bodyData.reason = reason;
            }
            if (cancelledBy !== undefined) {
                bodyData.cancelledBy = cancelledBy;
            }
            const response = await fetch(`${API_BASE_URL}/services/booking/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update booking status');
            return result;
        } catch (error: any) {
            console.error('Update Booking Status Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    replyToReview: async (reviewId: string, reply: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/review/${reviewId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to reply to review');
            return result;
        } catch (error: any) {
            console.error('Reply Review Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    likeReview: async (reviewId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/review/${reviewId}/like`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to like review');
            return result;
        } catch (error: any) {
            console.error('Like Review Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    unlikeReview: async (reviewId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/review/${reviewId}/unlike`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to unlike review');
            return result;
        } catch (error: any) {
            console.error('Unlike Review Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getNotifications: async (userId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/user/${userId}/notifications`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch notifications');
            return result;
        } catch (error: any) {
            console.error('Fetch Notifications Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    markNotificationAsRead: async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/services/notification/${id}/read`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to mark as read');
            return result;
        } catch (error: any) {
            console.error('Mark Read Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    createDispute: async (disputeData: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/disputes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(disputeData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to submit dispute');
            return result;
        } catch (error: any) {
            console.error('Submit Dispute Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    suspendUser: async (userId: string, reason: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/user/${userId}/suspend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to suspend user');
            return result;
        } catch (error: any) {
            console.error('Suspend User Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    unsuspendUser: async (userId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/user/${userId}/unsuspend`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to unsuspend user');
            return result;
        } catch (error: any) {
            console.error('Unsuspend User Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    }
};

export const rentalsApi = {
    getOwnerTools: async (userId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/owner/${userId}/tools`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch tools');
            return result;
        } catch (error: any) {
            console.error('Fetch Tools Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    addTool: async (userId: string, data: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/owner/${userId}/tools`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to add tool');
            return result;
        } catch (error: any) {
            console.error('Add Tool Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    updateTool: async (toolId: string, data: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/tool/${toolId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update tool');
            return result;
        } catch (error: any) {
            console.error('Update Tool Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    deleteTool: async (toolId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/tool/${toolId}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to delete tool');
            return result;
        } catch (error: any) {
            console.error('Delete Tool Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getOwnerStats: async (userId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/owner/${userId}/stats`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch stats');
            return result;
        } catch (error: any) {
            console.error('Fetch Stats Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getOwnerRentals: async (userId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/owner/${userId}/rentals`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch rentals');
            return result;
        } catch (error: any) {
            console.error('Fetch Rentals Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getToolsByCategory: async (category: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/category/${category}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch tools');
            return result;
        } catch (error: any) {
            console.error('Fetch Category Tools Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getNearbyTools: async (lat: number, lng: number, radius?: number) => {
        try {
            let url = `${API_BASE_URL}/rentals/nearby?lat=${lat}&lng=${lng}`;
            if (radius) url += `&radius=${radius}`;
            const response = await fetch(url);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch nearby tools');
            return result;
        } catch (error: any) {
            console.error('Fetch Nearby Tools Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getToolById: async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/${id}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch tool details');
            return result;
        } catch (error: any) {
            console.error('Fetch Tool Details Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    createRental: async (data: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create rental');
            return result;
        } catch (error: any) {
            console.error('Create Rental Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    updateRentalStatus: async (id: string, status: string, pickupPhotos?: string[], returnPhotos?: string[]) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, pickupPhotos, returnPhotos }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update status');
            return result;
        } catch (error: any) {
            console.error('Update Rental Status Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getUserRentals: async (userId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/user/${userId}/rentals`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch user rentals');
            return result;
        } catch (error: any) {
            console.error('Fetch User Rentals Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getToolReviews: async (toolId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/tool/${toolId}/reviews`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch reviews');
            return result;
        } catch (error: any) {
            console.error('Fetch Tool Reviews Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    requestExtension: async (rentalId: string, extensionDays: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/${rentalId}/extend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extensionDays }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to request extension');
            return result;
        } catch (error: any) {
            console.error('Request Extension Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    approveExtension: async (rentalId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/${rentalId}/extend/approve`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to approve extension');
            return result;
        } catch (error: any) {
            console.error('Approve Extension Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    rejectExtension: async (rentalId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/${rentalId}/extend/reject`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to reject extension');
            return result;
        } catch (error: any) {
            console.error('Reject Extension Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
    getRentalById: async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/transaction/${id}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch rental details');
            return result;
        } catch (error: any) {
            console.error('Fetch Rental Transaction Error:', error);
            throw new Error(error.message || 'Connection error');
        }
    },
};
