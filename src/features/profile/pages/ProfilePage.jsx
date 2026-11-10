import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AtSign, FileText, Mail, Pencil, Phone, Save, User, X } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import FormField from "../../../components/common/FormField";
import Alert from "../../../components/common/Alert";
import useFlashMessage from "../../../hooks/useFlashMessage";
import { updateProfile } from "../../../store/authSlice";
import { validateProfile } from "../../../utils/validators";

const STATUS_LABEL = { online: "Online", offline: "Offline" };

const pickFields = ({ fullName, email, phone, bio }) => ({
    fullName: fullName || "",
    email: email || "",
    phone: phone || "",
    bio: bio || "",
});

function ProfilePage() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const saving = useSelector((state) => state.auth.saving);
    const flash = useFlashMessage();

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(() => pickFields(user || {}));
    const [errors, setErrors] = useState({});

    if (!user) return null;

    const isDirty = JSON.stringify(form) !== JSON.stringify(pickFields(user));

    const startEdit = () => {
        setForm(pickFields(user));
        setErrors({});
        flash.clear();
        setEditing(true);
    };

    const cancelEdit = () => {
        setEditing(false);
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const validationErrors = validateProfile(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        const result = await dispatch(
            updateProfile({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                bio: form.bio.trim(),
            })
        );

        if (updateProfile.fulfilled.match(result)) {
            setEditing(false);
            flash.show("success", "Profile updated.");
        } else {
            flash.show("error", result.payload || "Could not save your profile. Try again.");
        }
    };

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

                {flash.message && (
                    <Alert type={flash.message.type}>{flash.message.text}</Alert>
                )}

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
                            {!editing && (
                                <button className="btn btn-ghost" onClick={startEdit}>
                                    <Pencil size={16} /> Edit profile
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <form className="form-stack" onSubmit={handleSave} noValidate>
                                <FormField
                                    label="Full name"
                                    icon={User}
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    error={errors.fullName}
                                />
                                <FormField
                                    label="Username"
                                    icon={AtSign}
                                    value={user.username}
                                    readOnly
                                    disabled
                                    hint="Your username can’t be changed."
                                />
                                <FormField
                                    label="Email"
                                    icon={Mail}
                                    type="email"
                                    name="email"
                                    placeholder="Optional"
                                    value={form.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                />
                                <FormField
                                    label="Phone"
                                    icon={Phone}
                                    name="phone"
                                    placeholder="Optional"
                                    value={form.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                />
                                <FormField
                                    label="Bio"
                                    multiline
                                    name="bio"
                                    placeholder="Tell people a little about yourself"
                                    value={form.bio}
                                    onChange={handleChange}
                                    error={errors.bio}
                                    hint={`${form.bio.length}/160`}
                                />

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={cancelEdit}
                                        disabled={saving}
                                    >
                                        <X size={18} /> Cancel
                                    </button>
                                    <button className="btn btn-primary" disabled={saving || !isDirty}>
                                        <Save size={18} /> {saving ? "Saving…" : "Save changes"}
                                    </button>
                                </div>
                            </form>
                        ) : (
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
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;