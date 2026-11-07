import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { request } from '../../../services/api/socketClient';
import '../../../styles/friend-requests.css';

export const FriendRequests = () => {
  const [requests, setRequests] = useState([
    { id: '1', name: 'Quang Duy', avatar: '' },
    { id: '2', name: 'Đá Cuội', avatar: '' },
    { id: '3', name: 'Thanh Trúc', avatar: '' }
  ]);
  const [sentRequests, setSentRequests] = useState([
    { id: '1', name: 'Phú Đỗ', time: 'Bạn đã gửi lời mời', avatar: '' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await request("GET_FRIEND_REQUESTS", {});
        if (Array.isArray(data)) {
          setRequests(data);
        }
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleRespond = async (username, accept) => {
    try {
      const eventName = accept ? "ACCEPT_FRIEND_REQUEST" : "REJECT_FRIEND_REQUEST";
      await request(eventName, { name: username });
      setRequests(prev => prev.filter(req => req.name !== username));
    } catch (err) {
      alert(err.message || "Thực hiện thất bại.");
    }
  };

  const handleRevoke = (username) => {
    setSentRequests(prev => prev.filter(req => req.name !== username));
  };

  return (
    <div className="friend-requests-container">
      <h2 className="friend-requests-title">Lời mời kết bạn</h2>

      <h3 className="friend-section-title">Lời mời đã nhận ({requests.length})</h3>

      {loading && <p style={{ color: '#6b7280' }}>Đang tải danh sách...</p>}

      {!loading && requests.length === 0 && (
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Không có lời mời kết bạn nào.</p>
      )}

      <div className="friend-cards-grid">
        {requests.map((user) => (
          <div key={user.name} className="friend-request-card">
            <div className="friend-card-header">
              <div className="friend-card-user-info">
                <img
                  src={user.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="friend-card-avatar"
                />
                <div className="friend-card-name-time">
                  <h4>{user.name}</h4>
                  <span>Từ số điện thoại</span>
                </div>
              </div>
              <MessageSquare size={18} color="#9ca3af" />
            </div>

            <p className="friend-card-message">
              Xin chào, mình là {user.name}. Kết bạn với mình nhé!
            </p>

            <div className="friend-card-actions">
              <button
                className="btn-reject"
                onClick={() => handleRespond(user.name, false)}
              >
                Từ chối
              </button>
              <button
                className="btn-accept"
                onClick={() => handleRespond(user.name, true)}
              >
                Đồng ý
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="friend-section-title">Lời mời đã gửi ({sentRequests.length})</h3>
      <div className="friend-cards-grid">
        {sentRequests.map((user) => (
          <div key={user.name} className="friend-request-card" style={{ maxWidth: '360px' }}>
            <div className="friend-card-header">
              <div className="friend-card-user-info">
                <img
                  src={user.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="friend-card-avatar"
                />
                <div className="friend-card-name-time">
                  <h4>{user.name}</h4>
                  <span>{user.time}</span>
                </div>
              </div>
              <MessageSquare size={18} color="#9ca3af" />
            </div>

            <button
              className="btn-revoke"
              onClick={() => handleRevoke(user.name)}
            >
              Thu hồi lời mời
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequests;
