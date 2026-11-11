import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AtSign, Camera, FileText, Mail, Pencil, Phone, Save, Trash2, User, X } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import FormField from "../../../components/common/FormField";
import Alert from "../../../components/common/Alert";
import useFlashMessage from "../../../hooks/useFlashMessage";
import { setUserStatus, updateProfile } from "../../../store/authSlice";
import { validateProfile } from "../../../utils/validators";
import { resizeImageToDataUrl, validateAvatarFile } from "../../../utils/image";

const STATUS_OPTIONS = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
];

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
    const fileInputRef = useRef(null);

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

    const handleAvatarPick = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        const problem = validateAvatarFile(file);
        if (problem) {
            flash.show("error", problem);
            return;
        }

        try {
            const dataUrl = await resizeImageToDataUrl(file);
            const result = await dispatch(updateProfile({ avatar: dataUrl }));

            if (updateProfile.fulfilled.match(result)) {
                flash.show("success", "Avatar updated.");
            } else {
                flash.show("error", result.payload || "Could not update your avatar.");
            }
        } catch (err) {
            flash.show("error", err.message);
        }
    };

    const handleAvatarRemove = async () => {
        const result = await dispatch(updateProfile({ avatar: null }));

        if (updateProfile.fulfilled.match(result)) {
            flash.show("success", "Avatar removed.");
        } else {
            flash.show("error", result.payload || "Could not remove your avatar.");
        }
    };

    const handleStatusChange = async (status) => {
        if (status === user.status) return;

        const result = await dispatch(setUserStatus(status));

        if (!setUserStatus.fulfilled.match(result)) {
            flash.show("error", result.payload || "Could not change your status.");
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

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            hidden
                            onChange={handleAvatarPick}
                        />
                        <div className="profile-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => fileInputRef.current.click()}
                                disabled={saving}
                            >
                                <Camera size={18} />
                                {user.avatar ? "Change avatar" : "Upload avatar"}
                            </button>

                            {user.avatar && (
                                <button
                                    className="btn btn-ghost"
                                    onClick={handleAvatarRemove}
                                    disabled={saving}
                                >
                                    <Trash2 size={18} /> Remove
                                </button>
                            )}
                        </div>
                        <span className="field-hint">PNG, JPG or WebP. Up to 2 MB.</span>

                        <span className="field-label profile-label">Status</span>
                        <div className="status-picker" role="radiogroup" aria-label="Your status">
                            {STATUS_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    role="radio"
                                    aria-checked={user.status === option.value}
                                    className={`status-option ${user.status === option.value ? "active" : ""}`}
                                    onClick={() => handleStatusChange(option.value)}
                                >
                                    <span className={`status-dot ${option.value}`} />
                                    {option.label}
                                </button>
                            ))}
                        </div>
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