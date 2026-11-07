
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import {
  fetchUsers,
  setSelectedUserProfile,
} from '../userSlice';
import '../../../styles/friend-list.css';

export const FriendList = () => {
  const dispatch = useDispatch();

  const {
    users,
    usersLoading,
    error,
    selectedUserProfile,
  } = useSelector((state) => state.user);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (users.length === 0 && !usersLoading) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length, usersLoading]);

  const displayList = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) =>
      String(user.name || '')
        .toLowerCase()
        .includes(keyword)
    );
  }, [users, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectUser = (user) => {
    dispatch(setSelectedUserProfile(user));
  };

  return (
    <aside className="friend-sidebar">
      <div className="friend-sidebar-header">
        <h2 className="friend-sidebar-title">
          Danh sách người dùng
        </h2>

        <div className="friend-search-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="friend-search-input"
          />

          <Search
            size={16}
            className="friend-search-icon"
          />
        </div>
      </div>

      <div className="friend-list-container">

        {usersLoading && (
          <p className="friend-loading-text">
            Đang tải danh sách người dùng...
          </p>
        )}

        {!usersLoading && error && (
          <p className="friend-empty-text">
            {error}
          </p>
        )}

        {!usersLoading && !error && displayList.length === 0 && (
          <p className="friend-empty-text">
            {searchTerm.trim()
              ? 'Không tìm thấy người dùng phù hợp.'
              : 'Chưa có người dùng nào.'}
          </p>
        )}

        {!usersLoading && !error && displayList.map((user) => (
          <div
            key={user.id}
            onClick={() => handleSelectUser(user)}
            className="friend-item"
          >
            <div className="friend-avatar-wrapper">
              <img
                src={
                  user.avatar ||
                  `https://i.pravatar.cc/150?u=${encodeURIComponent(user.id)}`
                }
                alt={user.name}
                className="friend-avatar"
              />
            </div>

            <div className="friend-info">
              <h4 className="friend-name">
                {user.name}
              </h4>

              <p className="friend-status-text">
                Trạng thái chưa xác định
              </p>
            </div>
          </div>
        ))}

      </div>

      {selectedUserProfile && (
        <div className="friend-profile-overlay">
          <div className="friend-profile-header">
            <h3 className="friend-profile-title">
              Thông tin cá nhân
            </h3>

            <button
              onClick={() => dispatch(setSelectedUserProfile(null))}
              className="friend-profile-close-btn"
            >
              <X size={20} />
            </button>
          </div>

          <div className="friend-profile-body">
            <img
              src={
                selectedUserProfile.avatar ||
                `https://i.pravatar.cc/150?u=${encodeURIComponent(selectedUserProfile.id)}`
              }
              alt={selectedUserProfile.name}
              className="friend-profile-avatar"
            />

            <div>
              <h4 className="friend-profile-name">
                {selectedUserProfile.name}
              </h4>

              <p className="friend-profile-status">
                Username: {selectedUserProfile.name}
              </p>

              <p className="friend-profile-status">
                Trạng thái: Chưa xác định
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
