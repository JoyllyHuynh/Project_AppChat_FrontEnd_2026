export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isUsername = (v) => /^[a-zA-Z0-9_]+$/.test(v);
export const validateLogin = ({ username, password }) => {
    const e = {};
    if (!username.trim()) e.username = 'Enter your username.';
    if (!password) e.password = 'Enter your password.';
    return e;
};

export const validateRegister = ({ username, password, confirmPassword, agree }) => {
    const e = {};
    if (!username.trim()) e.username = 'Enter a username.';
    else if (!isUsername(username.trim())) e.username = 'Use only letters, numbers and underscores.';
    if (password.length < 6) e.password = 'Use at least 6 characters.';
    if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match.';
    if (!agree) e.agree = 'Accept the terms to continue.';
    return e;
};

export const validateProfile = ({ fullName, email, phone, bio }) => {
    const e = {};
    const name = fullName.trim();
    if (name.length < 2) e.fullName = 'Enter your full name (at least 2 characters).';
    else if (name.length > 50) e.fullName = 'Keep your name under 50 characters.';
    if (email.trim() && !isEmail(email.trim())) e.email = 'Enter a valid email address.';
    if (phone.trim() && !/^\+?\d{9,12}$/.test(phone.replace(/\s/g, ''))) e.phone = 'Enter a valid phone number.';
    if (bio.length > 160) e.bio = 'Keep your bio under 160 characters.';
    return e;
};

export const validatePasswordChange = ({ currentPassword, newPassword, confirmPassword }) => {
    const e = {};
    if (!currentPassword) e.currentPassword = 'Enter your current password.';
    if (newPassword.length < 6) e.newPassword = 'Use at least 6 characters.';
    else if (newPassword === currentPassword) e.newPassword = 'Choose a different password.';
    if (confirmPassword !== newPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
};