import React from 'react';
import { FriendList } from '../components/FriendList';

export const FriendPage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <FriendList />
      <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-500">
        <p className="text-lg">Chọn một người bạn để xem thông tin hoặc trò chuyện</p>
      </div>
    </div>
  );
};

export default FriendPage;