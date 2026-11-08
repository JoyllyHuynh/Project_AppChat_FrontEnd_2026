import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, UsersRound, UserPlus, UserCheck, Search } from 'lucide-react';
import '../../../styles/friend-sub-sidebar.css';

export const FriendSubSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/friends/list' && (location.pathname === '/friends' || location.pathname === '/friends/')) {
      return true;
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="sub-sidebar">
      <div className="sub-sidebar-header">
        <div className="sub-sidebar-search-row">
          <div className="sub-sidebar-search-box">
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="sub-sidebar-input"
            />
            <Search className="sub-sidebar-search-icon" />
          </div>
          <div className="sub-sidebar-action-btn" title="Thêm bạn">
            <UserPlus size={18} />
          </div>
          <div className="sub-sidebar-action-btn" title="Tạo nhóm">
            <UsersRound size={18} />
          </div>
        </div>
      </div>

      <div className="sub-sidebar-nav">
        <div
          onClick={() => navigate('/friends/list')}
          className={`sub-sidebar-item ${isActive('/friends/list') ? 'active' : ''}`}
        >
          <Users size={20} />
          <span className="sub-sidebar-text">Danh sách bạn bè</span>
        </div>

        <div
          onClick={() => navigate('/friends/groups')}
          className={`sub-sidebar-item ${isActive('/friends/groups') ? 'active' : ''}`}
        >
          <UsersRound size={20} />
          <span className="sub-sidebar-text">Danh sách nhóm và cộng đồng</span>
        </div>

        <div
          onClick={() => navigate('/friends/requests')}
          className={`sub-sidebar-item ${isActive('/friends/requests') ? 'active' : ''}`}
        >
          <UserPlus size={20} />
          <span className="sub-sidebar-text">Lời mời kết bạn</span>
        </div>

        <div
          onClick={() => navigate('/friends/invites')}
          className={`sub-sidebar-item ${isActive('/friends/invites') ? 'active' : ''}`}
        >
          <UserCheck size={20} />
          <span className="sub-sidebar-text">Lời mời vào nhóm và cộng đồng</span>
        </div>
      </div>
    </div>
  );
};

export default FriendSubSidebar;