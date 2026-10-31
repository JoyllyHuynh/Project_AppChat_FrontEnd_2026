import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Mail, User, UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../../../components/common/FormField';
import { clearAuthFeedback, register } from '../../../store/authSlice';
import { validateRegister } from '../../../utils/validators';

export default function RegisterPage() {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((s) => s.auth);
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', agree: false });
    const [errors, setErrors] = useState({});

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
        setErrors(v);
        if (Object.keys(v).length === 0) dispatch(register(form));
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
                <FormField label="Full name" icon={User} name="fullName" autoComplete="name" placeholder="Ma Nguyen Vu" value={form.fullName} onChange={handleChange} error={errors.fullName} />
                <FormField label="Email" icon={Mail} name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
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