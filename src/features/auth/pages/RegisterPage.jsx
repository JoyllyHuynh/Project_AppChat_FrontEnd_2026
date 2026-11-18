import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, User, UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../../../components/common/FormField';
import Alert from '../../../components/common/Alert';
import { clearAuthFeedback, register } from '../../../store/authSlice';
import { validateRegister } from '../../../utils/validators';
import useUsernameAvailability from "../hooks/useUsernameAvailbility.js";

const TAKEN_MESSAGE = 'This username is already taken.';
export default function RegisterPage() {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((s) => s.auth);
    const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', agree: false });
    const [errors, setErrors] = useState({});
    const availability = useUsernameAvailability(form.username);

    useEffect(() => {
        dispatch(clearAuthFeedback());
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
        setErrors((p) => ({ ...p, [name]: undefined }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const v = validateRegister(form);
        if (!v.username && availability === 'taken') v.username = TAKEN_MESSAGE;
        setErrors(v);
        if (Object.keys(v).length === 0) dispatch(register({ ...form, username: form.username.trim() }));
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start chatting with your team in a minute."
            footer={
                <>
                    Already have an account? <Link className="auth-link" to="/login">Log in</Link>
                </>
            }
        >
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <Alert>{error}</Alert>
                <FormField
                    label="Username"
                    icon={User}
                    name="username"
                    autoComplete="username"
                    placeholder="Letters, numbers and underscores"
                    value={form.username}
                    onChange={handleChange}
                    error={errors.username || (availability === 'taken' ? TAKEN_MESSAGE : undefined)}
                    success={availability === 'available' ? 'Username is available.' : undefined}
                    hint={availability === 'checking' ? 'Checking availability…' : undefined}
                />
                <FormField label="Password" icon={Lock} name="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} error={errors.password} />
                <FormField label="Confirm password" icon={Lock} name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                <div>
                    <label className="auth-check">
                        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} /> I agree to the Terms and Privacy Policy
                    </label>
                    {errors.agree && <span className="field-error">{errors.agree}</span>}
                </div>
                <button className="btn btn-primary btn-block" disabled={loading}>
                    <UserPlus size={18} /> {loading ? 'Creating account…' : 'Create account'}
                </button>
            </form>
        </AuthLayout>
    );
}