const ago = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();

export const mockNotifications = [
    { id: 'n1', type: 'message', title: 'Linh Tran sent you a message', body: 'Did you see the new design?', createdAt: ago(3), read: false },
    { id: 'n2', type: 'mention', title: 'You were mentioned in Frontend Team', body: '@you can you review the PR?', createdAt: ago(45), read: false },
    { id: 'n3', type: 'friend', title: 'Minh Anh wants to connect', body: 'Accept the request to start chatting.', createdAt: ago(180), read: false },
    { id: 'n4', type: 'system', title: 'Password changed', body: 'Your password was updated successfully.', createdAt: ago(60 * 26), read: true },
    { id: 'n5', type: 'system', title: 'Welcome to WebChat', body: 'Set up your profile and avatar to get started.', createdAt: ago(60 * 24 * 5), read: true },
];