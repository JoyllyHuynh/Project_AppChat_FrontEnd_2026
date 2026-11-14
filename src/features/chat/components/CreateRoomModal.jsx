import React, { useState, useEffect } from 'react';
import { X, Camera, Search } from 'lucide-react';
import { getUserList, createChatRoom } from '../services/chatSocketService';
import '../../../styles/create-room-modal.css';

export const CreateRoomModal = ({ isOpen, onClose, onSuccess }) => {
  const [roomName, setRoomName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchContacts = async () => {
        setFetching(true);
        try {
          const data = await getUserList();
          if (Array.isArray(data)) {
            setContacts(data);
          }
        } catch (err) {
          console.error("Lỗi tải danh sách người dùng:", err);
        } finally {
          setFetching(false);
        }
      };
      fetchContacts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMember = (name) => {
    setSelectedMembers(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    try {
      await createChatRoom(roomName.trim());
      
      alert(`Tạo nhóm "${roomName.trim()}" thành công!`);
      setRoomName('');
      setSelectedMembers([]);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert(err.message || 'Tạo nhóm thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(user =>
    String(user.name || '').toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="zalo-modal-overlay">
      <div className="zalo-modal-container">
        <div className="zalo-modal-header">
          <h3>Tạo nhóm</h3>
          <button onClick={onClose} className="zalo-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreate}>
          <div className="zalo-modal-body">
            <div className="zalo-group-name-section">
              <div className="zalo-group-avatar-btn" title="Chọn ảnh nhóm">
                <Camera size={20} />
              </div>
              <input
                type="text"
                placeholder="Nhập tên nhóm..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="zalo-group-name-input"
                autoFocus
              />
            </div>

            <div className="zalo-member-search-box">
              <Search size={16} className="zalo-member-search-icon" />
              <input
                type="text"
                placeholder="Nhập tên, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="zalo-member-search-input"
              />
            </div>

            <div className="zalo-section-title">
              Danh sách liên hệ ({filteredContacts.length})
            </div>

            {fetching && <p style={{ fontSize: '13px', color: '#6b7280' }}>Đang tải danh sách...</p>}

            {!fetching && filteredContacts.length === 0 && (
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Không tìm thấy người dùng nào.</p>
            )}

            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {filteredContacts.map((user) => (
                <div
                  key={user.name}
                  className="zalo-contact-item"
                  onClick={() => handleToggleMember(user.name)}
                >
                  <div className="zalo-contact-info">
                    <img
                      src={user.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="zalo-contact-avatar"
                    />
                    <span className="zalo-contact-name">{user.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user.name)}
                    onChange={() => {}}
                    className="zalo-checkbox"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="zalo-modal-footer">
            <button type="button" onClick={onClose} className="zalo-btn-cancel">
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !roomName.trim()}
              className="zalo-btn-submit"
            >
              {loading ? 'Đang tạo...' : 'Tạo nhóm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;