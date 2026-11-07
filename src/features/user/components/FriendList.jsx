import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, Phone, MessageSquare, Edit2, UserPlus } from 'lucide-react';
import { fetchUsers, setSelectedUserProfile } from '../userSlice';
import { sendFriendRequest } from "../services/userSocketService";
import { request } from '../../../services/api/socketClient';
import '../../../styles/friend-list.css';

export const FriendList = () => {
  const dispatch = useDispatch();

  const {
    users: rawUsers,
    usersLoading,
    error,
    selectedUserProfile,
  } = useSelector((state) => state.user);

  const [usersWithStatus, setUsersWithStatus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState({});

  useEffect(() => {
    if (rawUsers.length === 0 && !usersLoading) {
      dispatch(fetchUsers());
    }
  }, [dispatch, rawUsers.length, usersLoading]);

  // Kiểm tra trạng thái online bằng API CHAT_CHECK_USER_ONLINE cho từng user khi danh sách thay đổi
  useEffect(() => {
    let isMounted = true;

    const checkOnlineStatuses = async () => {
      if (!rawUsers || rawUsers.length === 0) {
        setUsersWithStatus([]);
        return;
      }

      const updated = await Promise.all(
        rawUsers.map(async (user) => {
          try {
            const res = await request("CHAT_CHECK_USER_ONLINE", { user: user.name });
            return {
              ...user,
              isOnline: res?.status ?? false,
            };
          } catch (err) {
            return {
              ...user,
              isOnline: false,
            };
          }
        })
      );

      if (isMounted) {
        setUsersWithStatus(updated);
      }
    };

    checkOnlineStatuses();

    return () => {
      isMounted = false;
    };
  }, [rawUsers]);

  const displayList = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return usersWithStatus;

    return usersWithStatus.filter((user) =>
      String(user.name || '')
        .toLowerCase()
        .includes(keyword)
    );
  }, [usersWithStatus, searchTerm]);

  const groupedUsers = useMemo(() => {
    return displayList.reduce((acc, user) => {
      const firstLetter = String(user.name || '#').charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(user);
      return acc;
    }, {});
  }, [displayList]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSendFriendRequest = async () => {
    if (!selectedUserProfile) return;
    try {
      await sendFriendRequest(selectedUserProfile.name);
      setSentRequests((prev) => ({
        ...prev,
        [selectedUserProfile.name]: true,
      }));
      alert(`Đã gửi lời mời kết bạn tới ${selectedUserProfile.name} thành công!`);
    } catch (error) {
      alert(error.message || 'Gửi lời mời kết bạn thất bại.');
    }
  };

  const handleSelectUser = (user) => {
    dispatch(setSelectedUserProfile(user));
  };

  return (
    <aside className="friend-sidebar">
      <div className="friend-sidebar-header">
        <h2 className="friend-sidebar-title">
          Danh sách bạn bè ({usersWithStatus.length})
        </h2>

        <div className="friend-search-wrapper">
          <input
            type="text"
            placeholder="Tìm bạn..."
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
        {usersLoading && usersWithStatus.length === 0 && (
          <p className="friend-loading-text">
            Đang tải danh sách người dùng...
          </p>
        )}

        {!usersLoading && error && usersWithStatus.length === 0 && (
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

        {Object.keys(groupedUsers).sort().map((letter) => (
          <div key={letter} className="friend-group-section">
            <div className="friend-group-letter" style={{ padding: '8px 16px', fontWeight: 'bold', color: '#6b7280', fontSize: '13px' }}>
              {letter}
            </div>

            {groupedUsers[letter].map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="friend-item"
              >
                <div className="friend-avatar-wrapper" style={{ position: 'relative' }}>
                  <img
                    src={
                      user.avatar ||
                      `https://i.pravatar.cc/150?u=${encodeURIComponent(user.id)}`
                    }
                    alt={user.name}
                    className="friend-avatar"
                  />
                  {/* Chấm trạng thái online/offline */}
                  <span style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: user.isOnline ? '#22c55e' : '#9ca3af',
                    border: '2px solid #ffffff'
                  }} />
                </div>

                <div className="friend-info">
                  <h4 className="friend-name">
                    {user.name}
                  </h4>

                  <p className="friend-status-text">
                    <span style={{ color: user.isOnline ? '#22c55e' : '#6b7280' }}>
                      {user.isOnline ? "Đang hoạt động" : "Offline"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedUserProfile && (
        <div className="zalo-profile-modal-overlay">
          <div className="zalo-profile-modal">
            <div className="zalo-profile-header-bar">
              <span>Thông tin tài khoản</span>
              <button
                onClick={() => dispatch(setSelectedUserProfile(null))}
                className="zalo-profile-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="zalo-profile-content">
              <div className="zalo-profile-cover">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop"
                  alt="Cover"
                />
              </div>

              <div className="zalo-profile-user-section">
                <div className="zalo-profile-avatar-container">
                  <img
                    src={
                      selectedUserProfile.avatar ||
                      `https://i.pravatar.cc/150?u=${encodeURIComponent(selectedUserProfile.id)}`
                    }
                    alt={selectedUserProfile.name}
                  />
                </div>
                <div className="zalo-profile-name-row">
                  <h3>{selectedUserProfile.name}</h3>
                  <Edit2 size={16} className="zalo-edit-icon" />
                </div>
              </div>

              <div className="zalo-profile-actions">
                {selectedUserProfile.type === 'friend' ? (
                  <button className="zalo-action-btn">
                    <Phone size={18} /> Gọi điện
                  </button>
                ) : sentRequests[selectedUserProfile.name] ? (
                  <button className="zalo-action-btn" disabled style={{ backgroundColor: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed' }}>
                    <UserPlus size={18} /> Đã gửi yêu cầu
                  </button>
                ) : (
                  <button className="zalo-action-btn" onClick={handleSendFriendRequest}>
                    <UserPlus size={18} /> Kết bạn
                  </button>
                )}

                <button className="zalo-action-btn primary">
                  <MessageSquare size={18} /> Nhắn tin
                </button>
              </div>

              <div className="zalo-profile-section-block">
                <h4>Hình ảnh</h4>
                <p className="zalo-empty-photos">Chưa có ảnh nào được chia sẻ</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default FriendList;