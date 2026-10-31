import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormField({ label, icon: Icon, type = 'text', multiline = false, error, hint, ...props }) {
    const id = useId();
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';
    const Control = multiline ? 'textarea' : 'input';

    return (
        <div className="field">
            {label && (
                <label className="field-label" htmlFor={id}>
                    {label}
                </label>
            )}
            <div className={`field-control ${error ? 'has-error' : ''}`}>
                {Icon && <Icon size={18} />}
                <Control id={id} type={multiline ? undefined : isPassword && visible ? 'text' : type} aria-invalid={!!error} {...props} />
                {isPassword && (
                    <button type="button" className="field-toggle" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'}>
                        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error ? <span className="field-error">{error}</span> : hint && <span className="field-hint">{hint}</span>}
        </div>
    );
}