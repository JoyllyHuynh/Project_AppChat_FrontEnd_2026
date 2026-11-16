import { request } from "../../../services/api/socketClient";

export const getUserList = async () => {
    try {
        const data = await request("GET_USER_LIST", {});

        console.log("[GET_USER_LIST] Raw data:", data);

        if (!Array.isArray(data)) {
            throw new Error("Invalid user list data.");
        }

        console.table(
            data.map((item) => ({
                name: item.name,
                type: item.type,
                actionTime: item.actionTime,
            }))
        );

        return data.map((user) => ({
            id: user.name,
            name: user.name,
            type: Number(user.type),
            actionTime: user.actionTime,
        }));
    } catch (error) {
        console.error("[User API] GET_USER_LIST failed:", error);
        throw error;
    }
};

export const getFriendRequests = async () => {
    try {
        const data = await request("GET_FRIEND_REQUESTS", {});

        if (!Array.isArray(data)) {
            throw new Error("Dữ liệu danh sách lời mời không hợp lệ.");
        }

        return data.map((user) => ({
            id: user.name || user.id,
            name: user.name,
            avatar: user.avatar,
        }));
    } catch (error) {
        console.error("[User API] GET_FRIEND_REQUESTS failed:", error);

        throw error;
    }
};

export const sendFriendRequest = async (username) => {
    try {
        const response = await request("SEND_FRIEND_REQUEST", { name: username });

        return response;
    } catch (error) {
        console.error("[User API] SEND_FRIEND_REQUEST failed:", error);

        throw error;
    }
};

export const respondFriendRequest = async (username, isAccept) => {
    try {
        const eventName = isAccept ? "ACCEPT_FRIEND_REQUEST" : "REJECT_FRIEND_REQUEST";
        const response = await request(eventName, { name: username });

        return response;
    } catch (error) {
        console.error("[User API] Friend request response failed:", error);

        throw error;
    }
};