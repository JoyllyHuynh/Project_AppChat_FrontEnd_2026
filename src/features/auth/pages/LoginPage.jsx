import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Lock, LogIn, Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../../../components/common/FormField';

export default function LoginPage() {
    const { loading } = useSelector((s) => s.auth);
    const [form, setForm] = useState({ email: '', password: '', remember: true });
    const [errors, setErrors] = useState({});


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
        setErrors((p) => ({ ...p, [name]: undefined }));
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to continue your conversations."
            panel={{
                title: 'New to WebChat?',
                text: 'Create an account and start chatting with your team in a minute.',
                cta: 'Create account',
                to: '/register',
            }}
            footer={
                <>
                    New to WebChat? <Link className="auth-link" to="/register">Create an account</Link>
                </>
            }
        >
            <form className="auth-form" noValidate>
                <FormField label="Email" icon={Mail} name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
                <FormField label="Password" icon={Lock} name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={handleChange} error={errors.password} />
                <div className="auth-row">
                    <label className="auth-check">
                        <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} /> Keep me logged in
                    </label>
                    <Link className="auth-link" to="/forgot-password">Forgot password?</Link>
                </div>
                <button className="btn btn-primary btn-block" disabled={loading}>
                    <LogIn size={18} /> {loading ? 'Logging in…' : 'Log in'}
                </button>
                <p className="auth-demo">Demo account: demo@webchat.com / 123456</p>
            </form>
        </AuthLayout>
    );
}