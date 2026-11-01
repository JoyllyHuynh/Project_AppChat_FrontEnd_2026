import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import { fetchFriends, searchUsers, clearSearchResults, setSelectedUserProfile } from '../userSlice';
import '../../../styles/friend-list.css';

export const FriendList = () => {
  const dispatch = useDispatch();
  const { friends, friendsLoading, searchResults, searchLoading, selectedUserProfile } = useSelector((state) => state.user);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === '') {
      dispatch(clearSearchResults());
    } else {
      dispatch(searchUsers(keyword));
    }
  };

  const handleSelectUser = (user) => {
    dispatch(setSelectedUserProfile(user));
  };

  const isSearching = searchTerm.trim().length > 0;
  const displayList = isSearching ? searchResults : friends;
  const isLoading = isSearching ? searchLoading : friendsLoading;

  return (
    <aside className="friend-sidebar">
      <div className="friend-sidebar-header">
        <h2 className="friend-sidebar-title">Danh sách bạn bè</h2>
        <div className="friend-search-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="friend-search-input"
          />
          <Search size={16} className="friend-search-icon" />
        </div>
      </div>

      <div className="friend-list-container">
        {isLoading && (
          <p className="friend-loading-text">Đang tải...</p>
        )}

        {!isLoading && displayList.length === 0 && (
          <p className="friend-empty-text">
            {isSearching ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có bạn bè nào.'}
          </p>
        )}

        {!isLoading && displayList.map((user) => (
          <div
            key={user.id}
            onClick={() => handleSelectUser(user)}
            className="friend-item"
          >
            <div className="friend-avatar-wrapper">
              <img
                src={user.avatar || 'https://i.pravatar.cc/150?img=1'}
                alt={user.name}
                className="friend-avatar"
              />
              {user.status === "online" && (
                <span className="friend-status-dot"></span>
              )}
            </div>

            <div className="friend-info">
              <h4 className="friend-name">
                {user.name}
              </h4>
              <p className="friend-status-text">
                {user.status === "online" ? "Active now" : "Offline"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedUserProfile && (
        <div className="friend-profile-overlay">
          <div className="friend-profile-header">
            <h3 className="friend-profile-title">Thông tin cá nhân</h3>
            <button
              onClick={() => dispatch(setSelectedUserProfile(null))}
              className="friend-profile-close-btn"
            >
              <X size={20} />
            </button>
          </div>

          <div className="friend-profile-body">
            <img
              src={selectedUserProfile.avatar || 'https://i.pravatar.cc/150?img=1'}
              alt={selectedUserProfile.name}
              className="friend-profile-avatar"
            />
            <div>
              <h4 className="friend-profile-name">
                {selectedUserProfile.name}
              </h4>
              <p className="friend-profile-status">
                Trạng thái: <span style={{ color: selectedUserProfile.status === 'online' ? '#22c55e' : 'inherit' }}>
                  {selectedUserProfile.status === 'online' ? 'Đang hoạt động' : 'Offline'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};