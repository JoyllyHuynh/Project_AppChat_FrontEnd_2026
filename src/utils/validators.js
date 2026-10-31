export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const validateLogin = ({ email, password }) => {
    const e = {};
    if (!email.trim()) e.email = 'Enter your email.';
    else if (!isEmail(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Enter your password.';
    return e;
};

export const validateRegister = ({ fullName, email, password, confirmPassword, agree }) => {
    const e = {};
    if (fullName.trim().length < 2) e.fullName = 'Enter your full name.';
    if (!email.trim()) e.email = 'Enter your email.';
    else if (!isEmail(email)) e.email = 'Enter a valid email address.';
    if (password.length < 6) e.password = 'Use at least 6 characters.';
    if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match.';
    if (!agree) e.agree = 'Accept the terms to continue.';
    return e;
};

export const validateProfile = ({ fullName, username, phone, bio }) => {
    const e = {};
    if (fullName.trim().length < 2) e.fullName = 'Enter your full name.';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) e.username = '3–20 characters: letters, numbers, underscore.';
    if (phone && !/^\+?\d{9,12}$/.test(phone.replace(/\s/g, ''))) e.phone = 'Enter a valid phone number.';
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