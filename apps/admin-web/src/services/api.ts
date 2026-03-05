const API_BASE_URL = 'http://localhost:5000'; // Update this if your backend uses a different URL

export const adminApi = {
    getPendingVerifications: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/pending-verifications`);
        if (!response.ok) throw new Error('Failed to fetch pending verifications');
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
    }
};
