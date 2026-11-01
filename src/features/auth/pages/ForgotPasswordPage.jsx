import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../../../components/common/FormField';
import Alert from '../../../components/common/Alert';
import { clearAuthFeedback, forgotPassword } from '../../../store/authSlice';
import { isEmail } from '../../../utils/validators';

export default function ForgotPasswordPage() {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((s) => s.auth);
    const [email, setEmail] = useState('');
    const [fieldError, setFieldError] = useState('');
    const [sent, setSent] = useState(false);

    useEffect(() => {
        dispatch(clearAuthFeedback());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEmail(email)) return setFieldError('Enter a valid email address.');
        setFieldError('');
        const result = await dispatch(forgotPassword({ email }));
        if (forgotPassword.fulfilled.match(result)) setSent(true);
    };

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Enter your email and we’ll send you a link to reset your password."
            footer={
                <Link className="auth-link auth-back" to="/login">
                    <ArrowLeft size={16} /> Back to log in
                </Link>
            }
        >
            {sent ? (
                <Alert type="success">If an account exists for {email}, a reset link is on its way. Check your inbox.</Alert>
            ) : (
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <Alert>{error}</Alert>
                    <FormField label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldError} />
                    <button className="btn btn-primary btn-block" disabled={loading}>
                        <Send size={18} /> {loading ? 'Sending…' : 'Send reset link'}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
}