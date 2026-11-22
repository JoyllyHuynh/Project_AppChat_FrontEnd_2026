import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { getUserList } from '../services/chatSocketService';
import '../../../styles/add-member-modal.css';

export const AddMemberModal = ({ isOpen, onClose, onAddMembers, existingMembers = [] }) => {
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchContacts = async () => {
                setFetching(true);
                try {
                    const data = await getUserList();
                    let userArray = [];
                    if (Array.isArray(data)) {
                        userArray = data;
                    } else if (data && Array.isArray(data.users)) {
                        userArray = data.users;
                    } else if (data && Array.isArray(data.data)) {
                        userArray = data.data;
                    } else if (data && Array.isArray(data.list)) {
                        userArray = data.list;
                    }

                    const filtered = userArray.filter(user => {
                        if (user.type === 1 || user.type === "room" || user.isGroup) {
                            return false;
                        }

                        const userName = user.name || user.username || user;
                        if (userName === existingMembers[0]) {
                            return false;
                        }
                        return !existingMembers.includes(userName);
                    });

                    setContacts(filtered);
                } catch (err) {
                    console.error("Lỗi tải danh sách liên hệ:", err);
                } finally {
                    setFetching(false);
                }
            };
            fetchContacts();
            setSelectedUserIds([]);
            setSearchTerm('');
        }
    }, [isOpen, existingMembers]);

    if (!isOpen) return null;

    const handleToggleSelect = (userId) => {
        setSelectedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleConfirmAdd = () => {
        if (selectedUserIds.length === 0) return;
        onAddMembers(selectedUserIds);
        onClose();
    };

    const filteredContacts = contacts.filter(contact => {
        const name = contact.name || contact.username || String(contact);
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="add-member-overlay" onClick={onClose}>
            <div className="add-member-container" onClick={e => e.stopPropagation()}>

                <div className="add-member-header">
                    <h3 className="add-member-title">Thêm thành viên vào nhóm</h3>
                    <button className="add-member-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="add-member-search-box">
                    <Search size={18} color="#6b7280" />
                    <input
                        type="text"
                        placeholder="Nhập tên người cần thêm..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="add-member-search-input"
                    />
                </div>

                <div className="add-member-list">
                    {fetching ? (
                        <p className="add-member-status-text">Đang tải danh sách...</p>
                    ) : filteredContacts.length === 0 ? (
                        <p className="add-member-status-text">Không tìm thấy người dùng phù hợp.</p>
                    ) : (
                        filteredContacts.map((contact, idx) => {
                            const name = contact.name || contact.username || String(contact);
                            const id = contact.id || name;
                            const isChecked = selectedUserIds.includes(id);

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleToggleSelect(id)}
                                    className={`add-member-item ${isChecked ? 'selected' : ''}`}
                                >
                                    <div className="add-member-user-info">
                                        <img
                                            src={contact.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`}
                                            alt="avatar"
                                            className="add-member-avatar"
                                        />
                                        <span className="add-member-name">{name}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => { }}
                                        className="add-member-checkbox"
                                    />
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="add-member-footer">
                    <button className="add-member-cancel-btn" onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        className="add-member-submit-btn"
                        onClick={handleConfirmAdd}
                        disabled={selectedUserIds.length === 0}
                    >
                        Thêm ({selectedUserIds.length})
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddMemberModal;