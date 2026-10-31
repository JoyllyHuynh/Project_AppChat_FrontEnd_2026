import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children, footer, panel }) {
    return (
        <div className="auth-page">
            <div className={`auth-card ${panel ? 'with-panel' : ''}`}>
                {panel && (
                    <aside className="auth-panel">
                        <h2 className="auth-panel-title">{panel.title}</h2>
                        <p className="auth-panel-text">{panel.text}</p>
                        <Link to={panel.to} className="btn btn-outline-light">
                            {panel.cta}
                        </Link>
                    </aside>
                )}

                <div className="auth-content">
                    <div className="auth-logo">
                        <MessageCircle size={24} color="#fff" />
                    </div>
                    <h1 className="auth-title">{title}</h1>
                    <p className="auth-subtitle">{subtitle}</p>
                    {children}
                    {footer && <p className="auth-footer">{footer}</p>}
                </div>
            </div>
        </div>
    );
}