const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];

const getInitials = (name = '') => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '?';
    const first = words[0][0];
    const last = words.length > 1 ? words[words.length - 1][0] : '';
    return (first + last).toUpperCase();
};

const getColor = (name = '') => COLORS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % COLORS.length];

export default function Avatar({ name, src, size = 40, status }) {
    return (
        <span className="avatar" style={{ width: size, height: size }}>
      {src ? (
          <img className="avatar-img" src={src} alt={name} />
      ) : (
          <span className="avatar-fallback" style={{ background: getColor(name), fontSize: size * 0.38 }}>
          {getInitials(name)}
        </span>
      )}
            {status && <span className={`avatar-status ${status}`} title={status} />}
    </span>
    );
}