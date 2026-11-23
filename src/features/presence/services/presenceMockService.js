const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const checkUserOnline = async (username) => {
    await delay();
    const sum = [...username].reduce((total, char) => total + char.charCodeAt(0), 0);
    return sum % 2 === 0;
};