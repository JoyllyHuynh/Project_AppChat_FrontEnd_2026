import { useSelector } from "react-redux";
import { AtSign, FileText, Mail, Phone, User } from "lucide-react";
import Avatar from "../../../components/common/Avatar.jsx";

const STATUS_LABEL = { online: "Online", offline: "Offline" };

function ProfilePage() {
    const user = useSelector((state) => state.auth.user);

    if (!user) return null;

    const rows = [
        { icon: User, label: "Full name", value: user.fullName },
        { icon: AtSign, label: "Username", value: `@${user.username}` },
        { icon: Mail, label: "Email", value: user.email },
        { icon: Phone, label: "Phone", value: user.phone },
        { icon: FileText, label: "Bio", value: user.bio },
    ];

    return (
        <div className="page">
            <div className="page-inner">
                <header className="page-header">
                    <div>
                        <h1>Profile</h1>
                        <p>Your personal information.</p>
                    </div>
                </header>

                <div className="profile-grid">
                    <section className="card profile-side">
                        <Avatar
                            name={user.fullName}
                            src={user.avatar}
                            size={112}
                            status={user.status}
                        />
                        <h2>{user.fullName}</h2>
                        <span className="muted">@{user.username}</span>
                        <span className="profile-status">
                            <span className={`status-dot ${user.status}`} />
                            {STATUS_LABEL[user.status] || "Offline"}
                        </span>
                    </section>

                    <section className="card">
                        <div className="card-head">
                            <h2>Personal information</h2>
                        </div>

                        <dl className="info-list">
                            {rows.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="info-row">
                                    <dt>
                                        <Icon size={16} /> {label}
                                    </dt>
                                    <dd>
                                        {value || <span className="muted">Not set</span>}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;