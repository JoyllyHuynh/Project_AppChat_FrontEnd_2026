export const userService = {
    getFriends: async () => {
        const response = await fetch('/api/users/friends');
        if (!response.ok) throw new Error('Không thể tải danh sách bạn bè');
        return await response.json();
    },
    searchUsers: async (keyword) => {
        const response = await fetch(`/api/users/search?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) throw new Error('Lỗi tìm kiếm người dùng');
        return await response.json();
    },
    getUserProfile: async (userId) => {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Không thể tải thông tin người dùng');
        return await response.json();
    }
};