import React, { useState } from 'react';
import { Bell, Pin, UserPlus, Settings, ChevronDown, ChevronUp, Users } from 'lucide-react';
import '../../../styles/chat-info-panel.css';

export const ChatInfoPanel = ({ roomName, members = [], onAddMember, onRemoveMember }) => {
  const [isMembersOpen, setIsMembersOpen] = useState(true);

  return (
    <div className="chat-info-panel">
      <div className="chat-info-header">Thông tin nhóm</div>

      <div className="chat-info-main">
        <div className="chat-info-avatar-group">
          <Users size={32} color="#0068ff" />
        </div>
        <div className="chat-info-group-name">{roomName || 'Nhóm chat'}</div>

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
