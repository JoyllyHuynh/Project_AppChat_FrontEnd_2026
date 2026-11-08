import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AtSign, Bell, CheckCheck, Info, Loader2, MessageSquare, RefreshCw, UserPlus } from 'lucide-react';
import Alert from '../../../components/common/Alert';
import { fetchNotifications, markAllAsRead, markAsRead, selectNotifications, selectUnreadCount } from '../notificationSlice';
import { formatRelativeTime } from '../../../utils/formatTime';

const ICONS = { message: MessageSquare, mention: AtSign, friend: UserPlus, system: Info };

export default function NotificationsPage() {
    const dispatch = useDispatch();
    const items = useSelector(selectNotifications);
    const unread = useSelector(selectUnreadCount);
    const { status, error } = useSelector((s) => s.notifications);
    const [tab, setTab] = useState('all');

    useEffect(() => {
        const request = dispatch(fetchNotifications());
        return () => request.abort();
    }, [dispatch]);

    const visible = useMemo(
        () =>
            items
                .filter((n) => (tab === 'unread' ? !n.read : true))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [items, tab]
    );

    const isLoading = (status === 'idle' || status === 'loading') && items.length === 0;
    const loadFailed = status === 'failed' && items.length === 0;

    const handleOpen = (n) => {
        if (!n.read) dispatch(markAsRead(n.id));
    };

    return (
        <div className="page">
            <div className="page-inner">
                <header className="page-header">
                    <div>
                        <h1>Notifications</h1>
                        <p>{unread > 0 ? `You have ${unread} unread notification${unread > 1 ? 's' : ''}.` : 'You’re all caught up.'}</p>
                    </div>
                    <button className="btn btn-ghost" onClick={() => dispatch(markAllAsRead())} disabled={unread === 0}>
                        <CheckCheck size={18} /> Mark all as read
                    </button>
                </header>

                {!loadFailed && <Alert>{error}</Alert>}

                <div className="tabs" role="tablist">
                    {[
                        ['all', 'All'],
                        ['unread', `Unread (${unread})`],
                    ].map(([key, label]) => (
                        <button key={key} role="tab" aria-selected={tab === key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                            {label}
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className="empty" role="status">
                        <Loader2 size={28} className="spin" />
                        <p>Loading notifications…</p>
                    </div>
                )}

                {loadFailed && (
                    <div className="empty">
                        <Alert>{error}</Alert>
                        <button className="btn btn-ghost" onClick={() => dispatch(fetchNotifications())}>
                            <RefreshCw size={16} /> Try again
                        </button>
                    </div>
                )}

                {!isLoading && !loadFailed && visible.length === 0 && (
                    <div className="empty">
                        <Bell size={32} />
                        <p>{tab === 'unread' ? 'No unread notifications.' : 'No notifications yet. New activity will show up here.'}</p>
                    </div>
                )}

                {visible.length > 0 && (
                    <ul className="notif-list">
                        {visible.map((n) => {
                            const Icon = ICONS[n.type] || Bell;
                            return (
                                <li key={n.id}>
                                    <button className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => handleOpen(n)} aria-label={n.read ? n.title : `${n.title}, mark as read`}>
                    <span className={`notif-icon ${n.type}`}>
                      <Icon size={18} />
                    </span>
                                        <span className="notif-text">
                      <span className="notif-title">{n.title}</span>
                      <span className="notif-body">{n.body}</span>
                    </span>
                                        <span className="notif-meta">
                      <span>{formatRelativeTime(n.createdAt)}</span>
                                            {!n.read && <span className="notif-dot" />}
                    </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}