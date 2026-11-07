import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Alert({ type = 'error', children }) {
    if (!children) return null;
    const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
    return (
        <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
            <Icon size={18} />
            <span>{children}</span>
        </div>
    );
}