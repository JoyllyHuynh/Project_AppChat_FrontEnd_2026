import { useDispatch, useSelector } from "react-redux";
import { LogOut, RotateCcw } from "lucide-react";
import Alert from "../../../components/common/Alert";
import Toggle from "../../../components/common/Toggle";
import useFlashMessage from "../../../hooks/useFlashMessage";
import useSettings from "../hooks/useSettings";
import { SETTING_GROUPS } from "../settingsConfig";
import { logout } from "../../../store/authSlice";
import BrowserPermissionNotice from "../../notifications/components/BrowserPermissionNotice";

function SettingsPage() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const loggingOut = useSelector((state) => state.auth.loading);
    const { settings, toggle, reset } = useSettings();
    const flash = useFlashMessage();

    if (!user) return null;

    const handleReset = () => {
        reset();
        flash.show("success", "Settings restored to defaults.");
    };

    return (
        <div className="page">
            <div className="page-inner">
                <header className="page-header">
                    <div>
                        <h1>Settings</h1>
                        <p>Choose how WebChat notifies you. Settings are saved on this device.</p>
                    </div>
                    <button className="btn btn-ghost" onClick={handleReset}>
                        <RotateCcw size={16} /> Restore defaults
                    </button>
                </header>

                {flash.message && (
                    <Alert type={flash.message.type}>{flash.message.text}</Alert>
                )}

                {SETTING_GROUPS.map((group) => (
                    <section key={group.title} className="card settings-section">
                        <h2>{group.title}</h2>

                        {group.items.map((item) => (
                            <div key={item.key} className="setting-row">
                                <div>
                                    <div className="setting-label">{item.label}</div>
                                    <div className="muted">{item.description}</div>
                                </div>
                                <Toggle
                                    checked={settings[item.key]}
                                    label={item.label}
                                    onChange={() => toggle(item.key)}
                                />
                            </div>
                        ))}

                        {group.title === "Notifications" && (
                            <BrowserPermissionNotice enabled={settings.desktopNotifications} />
                        )}
                    </section>
                ))}

                <section className="card settings-section">
                    <h2>Account</h2>

                    <div className="setting-row">
                        <div>
                            <div className="setting-label">Signed in as</div>
                            <div className="muted">@{user.username}</div>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div>
                            <div className="setting-label">Log out</div>
                            <div className="muted">
                                You’ll need to log in again to see your messages.
                            </div>
                        </div>
                        <button
                            className="btn btn-danger"
                            onClick={() => dispatch(logout())}
                            disabled={loggingOut}
                        >
                            <LogOut size={18} /> {loggingOut ? "Logging out…" : "Log out"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default SettingsPage;