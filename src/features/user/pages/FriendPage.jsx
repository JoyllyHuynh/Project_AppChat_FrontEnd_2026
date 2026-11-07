import React from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import { FriendList } from '../components/FriendList';

export const FriendPage = () => {
  return (
<<<<<<< HEAD
    <div className="flex h-screen bg-gray-50">
      <FriendList />
      <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-500">
        <p className="text-lg">Chọn một người bạn để xem thông tin hoặc trò chuyện</p>
=======
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1, height: '100vh', overflow: 'hidden' }}>
        <FriendList />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
          <p style={{ fontSize: '18px', margin: 0 }}>
            Chọn một người dùng để xem thông tin hoặc trò chuyện
          </p>
        </div>
>>>>>>> 2e73fb3 (Chỉnh lại giao diện của profile, import thêm sidebar, cập nhật api)
      </div>
    </div>
  );
};

export default FriendPage;