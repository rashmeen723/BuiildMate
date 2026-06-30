const API_BASE_URL = 'http://localhost:5000';

const getHeaders = (extraHeaders: Record<string, string> = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return {
        ...extraHeaders,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const adminApi = {
    login: async (email: string, password: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Invalid credentials');
        }
        return response.json();
    },

    forgotPassword: async (email: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to send reset email');
        }
        return response.json();
    },

    resetPassword: async (email: string, code: string, newPassword?: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, newPassword }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to reset password');
        }
        return response.json();
    },

    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch admin stats');
        return response.json();
    },

    getPendingVerifications: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/pending-verifications`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch pending verifications');
        return response.json();
    },

    getProviders: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/providers`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch providers');
        return response.json();
    },

    getServices: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/services`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch services');
        return response.json();
    },

    deleteCategory: async (type: 'service' | 'rental', name: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/category/${type}/${encodeURIComponent(name)}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete category');
        return response.json();
    },

    addCategory: async (type: 'service' | 'rental', name: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/category`, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ type, name }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to add category');
        }
        return response.json();
    },

    updateCategory: async (type: 'service' | 'rental', oldName: string, newName: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/category`, {
            method: 'PUT',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ type, oldName, newName }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to update category');
        }
        return response.json();
    },

    getVerificationDetails: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/verification/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch verification details');
        return response.json();
    },

    updateVerificationStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
        const response = await fetch(`${API_BASE_URL}/admin/verify/${id}`, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update verification status');
        return response.json();
    },

    getDisputes: async () => {
        const response = await fetch(`${API_BASE_URL}/disputes`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch disputes');
        return response.json();
    },

    getDisputeDetails: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/disputes/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch dispute details');
        return response.json();
    },

    resolveDispute: async (
        id: string,
        data: {
            status: 'RESOLVED' | 'DISMISSED';
            resolution: string;
            adjustTrustScore?: boolean;
            penaltyAmount?: number;
        }
    ) => {
        const response = await fetch(`${API_BASE_URL}/disputes/${id}/resolve`, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to resolve dispute');
        return response.json();
    },

    suspendUser: async (id: string, reason: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/user/${id}/suspend`, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error('Failed to suspend user');
        return response.json();
    },

    unsuspendUser: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/user/${id}/unsuspend`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to unsuspend user');
        return response.json();
    },

    deleteUser: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/user/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response.json();
    },

    getMonthlyReport: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/reports/monthly`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch monthly report');
        return response.json();
    },

    changePassword: async (currentPassword?: string, newPassword?: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to change password');
        }
        return response.json();
    },

    getSettings: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/settings`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch platform settings');
        return response.json();
    },

    updateSettings: async (serviceCommissionRate: number, rentalCommissionRate: number) => {
        const response = await fetch(`${API_BASE_URL}/admin/settings`, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ serviceCommissionRate, rentalCommissionRate }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to update platform settings');
        }
        return response.json();
    },

    broadcastAnnouncement: async (data: { title: string; message: string; targetAudience: 'ALL' | 'SERVICE_PROVIDER' | 'RENTAL_OWNER' | 'HOUSEHOLD' }) => {
        const response = await fetch(`${API_BASE_URL}/admin/broadcast`, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to dispatch broadcast announcement');
        }
        return response.json();
    }
};
