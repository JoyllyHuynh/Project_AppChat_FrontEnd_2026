import React from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import { FriendList } from '../components/FriendList';

export const FriendPage = () => {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1, height: '100vh', overflow: 'hidden' }}>
        <FriendList />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
          <p style={{ fontSize: '18px', margin: 0 }}>
            Chọn một người dùng để xem thông tin hoặc trò chuyện
          </p>
        </div>
      </div>
    </div>
  );
};

export default FriendPage;