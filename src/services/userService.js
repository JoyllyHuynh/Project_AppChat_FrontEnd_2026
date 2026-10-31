export const userService = {
  getFriends: async () => {
    // Giả lập độ trễ mạng 500ms
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Nguyễn Văn A', status: 'online', avatar: 'https://i.pravatar.cc/150?img=1' },
          { id: 2, name: 'Trần Thị B', status: 'offline', avatar: 'https://i.pravatar.cc/150?img=5' },
        ]);
      }, 500);
    });
  },

  searchUsers: async (keyword) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAllUsers = [
          { id: 1, name: 'Nguyễn Văn A', status: 'online', avatar: 'https://i.pravatar.cc/150?img=1' },
          { id: 2, name: 'Trần Thị B', status: 'offline', avatar: 'https://i.pravatar.cc/150?img=5' },
          { id: 3, name: 'Lê Văn C', status: 'online', avatar: 'https://i.pravatar.cc/150?img=8' },
        ];
        const result = mockAllUsers.filter(u => u.name.toLowerCase().includes(keyword.toLowerCase()));
        resolve(result);
      }, 300);
    });
  }
};