const API_BASE_URL = 'http://localhost:5000'; // Update this if your backend uses a different URL

export const adminApi = {
    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/stats`);
        if (!response.ok) throw new Error('Failed to fetch admin stats');
        return response.json();
    },

    getPendingVerifications: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/pending-verifications`);
        if (!response.ok) throw new Error('Failed to fetch pending verifications');
        return response.json();
    },

    getProviders: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/providers`);
        if (!response.ok) throw new Error('Failed to fetch providers');
        return response.json();
    },

    getServices: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/services`);
        if (!response.ok) throw new Error('Failed to fetch services');
        return response.json();
    },

    deleteCategory: async (type: 'service' | 'rental', name: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/category/${type}/${encodeURIComponent(name)}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete category');
        return response.json();
    },

    addCategory: async (type: 'service' | 'rental', name: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/category`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, oldName, newName }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to update category');
        }
        return response.json();
    },

    getVerificationDetails: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/verification/${id}`);
        if (!response.ok) throw new Error('Failed to fetch verification details');
        return response.json();
    },

    updateVerificationStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
        const response = await fetch(`${API_BASE_URL}/admin/verify/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update verification status');
        return response.json();
    },

    getDisputes: async () => {
        const response = await fetch(`${API_BASE_URL}/disputes`);
        if (!response.ok) throw new Error('Failed to fetch disputes');
        return response.json();
    },

    getDisputeDetails: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/disputes/${id}`);
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to resolve dispute');
        return response.json();
    },

    suspendUser: async (id: string, reason: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/user/${id}/suspend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error('Failed to suspend user');
        return response.json();
    },

    unsuspendUser: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/user/${id}/unsuspend`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to unsuspend user');
        return response.json();
    },

    deleteUser: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/user/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response.json();
    }
};
