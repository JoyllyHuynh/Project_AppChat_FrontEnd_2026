import React from 'react';
import { Search } from 'lucide-react';

export const FriendList = () => {
    // Dữ liệu mẫu danh sách bạn bè
    const friends = [
        { id: 1, name: 'Nguyễn Văn A', status: 'online', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 2, name: 'Trần Thị B', status: 'offline', avatar: 'https://i.pravatar.cc/150?img=5' },
    ];

    return (
        <aside className="chat-sidebar" style={{ width: '340px', display: 'flex', flexDirection: 'column', height: '100vh', borderRight: '1px solid var(--border)' }}>
            {/* Header của FriendList (tương tự header sidebar chat) */}
            <div className="sidebar-header" style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Danh sách bạn bè</h2>
                
                {/* Thanh tìm kiếm */}
                <div style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm bạn bè..." 
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            paddingLeft: '36px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--code-bg)',
                            color: 'var(--text-h)',
                            outline: 'none',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                    />
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }} />
                </div>
            </div>

            {/* Danh sách items bạn bè */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {friends.map((friend) => (
                    <div 
                        key={friend.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--code-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {/* Avatar và trạng thái online */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <img 
                                src={friend.avatar} 
                                alt={friend.name} 
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            {friend.status === "online" && (
                                <span style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    right: '2px',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: '#22c55e',
                                    border: '2px solid var(--bg)'
                                }}></span>
                            )}
                        </div>

                        {/* Thông tin tên và trạng thái */}
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                            <h4 style={{ 
                                fontSize: '15px', 
                                fontWeight: '500', 
                                color: 'var(--text-h)', 
                                margin: '0 0 4px 0',
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis' 
                            }}>
                                {friend.name}
                            </h4>
                            <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0, textTransform: 'capitalize' }}>
                                {friend.status === "online" ? "Active now" : "Offline"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};