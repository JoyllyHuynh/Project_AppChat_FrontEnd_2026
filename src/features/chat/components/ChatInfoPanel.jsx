import React, { useState, useEffect } from 'react';
import { Bell, Pin, UserPlus, Settings, ChevronDown, ChevronUp, Users, Pencil, Check, X } from 'lucide-react';
import '../../../styles/chat-info-panel.css';

export const ChatInfoPanel = ({ roomName, members = [], onAddMember, onRemoveMember, onRenameRoom }) => {
  const [isMembersOpen, setIsMembersOpen] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(roomName || '');

  useEffect(() => {
    setDraftName(roomName || '');
    setIsEditingName(false);
  }, [roomName]);

  const handleSaveName = () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    onRenameRoom && onRenameRoom(trimmed);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setDraftName(roomName || '');
    setIsEditingName(false);
  };

  return (
    <div className="chat-info-panel">
      <div className="chat-info-header">Thông tin nhóm</div>

      <div className="chat-info-main">
        <div className="chat-info-avatar-group">
          <Users size={32} color="#0068ff" />
        </div>
        {isEditingName ? (
          <div className="chat-info-rename-box">
            <input
              type="text"
              className="chat-info-rename-input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Nhập tên nhóm mới..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <button type="button" className="chat-info-rename-btn save" title="Lưu" onClick={handleSaveName}>
              <Check size={15} />
            </button>
            <button type="button" className="chat-info-rename-btn cancel" title="Hủy" onClick={handleCancelEdit}>
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="chat-info-name-row">
            <span className="chat-info-group-name">{roomName || 'Nhóm chat'}</span>
            <button
              type="button"
              className="chat-info-edit-name-btn"
              title="Đổi tên nhóm"
              onClick={() => {
                setDraftName(roomName || '');
                setIsEditingName(true);
              }}
            >
              <Pencil size={14} />
            </button>
          </div>
        )}

        <div className="chat-info-actions">
          <button className="chat-action-btn-item" title="Tắt thông báo">
            <div className="chat-action-icon"><Bell size={18} /></div>
            <span>Tắt thông báo</span>
          </button>
          <button className="chat-action-btn-item" title="Ghim hội thoại">
            <div className="chat-action-icon"><Pin size={18} /></div>
            <span>Ghim</span>
          </button>
          <button className="chat-action-btn-item" title="Thêm thành viên" onClick={onAddMember}>
            <div className="chat-action-icon"><UserPlus size={18} /></div>
            <span>Thêm thành viên</span>
          </button>
          <button className="chat-action-btn-item" title="Quản lý nhóm">
            <div className="chat-action-icon"><Settings size={18} /></div>
            <span>Quản lý</span>
          </button>
        </div>
      </div>


      <div className="chat-info-section">
        <div
          className="chat-section-header"
          onClick={() => setIsMembersOpen(!isMembersOpen)}
        >
          <span>Thành viên nhóm ({members.length})</span>
          {isMembersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {isMembersOpen && (
          <div className="member-list-container">
            {members.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#6b7280', padding: '4px 0' }}>Chưa có thành viên nào.</p>
            ) : (
              members.map((member, index) => (
                <div key={index} className="member-item">
                  <div className="member-info">
                    <img
                      src={member.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(member.name || member)}`}
                      alt="avatar"
                      className="member-avatar"
                    />
                    <span className="member-name">{member.name || member}</span>
                  </div>
                  <button
                    className="remove-member-btn"
                    onClick={() => onRemoveMember && onRemoveMember(member.name || member)}
                  >
                    Xóa
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInfoPanel;
