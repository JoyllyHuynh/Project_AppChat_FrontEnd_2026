
import { request, send } from "../../../services/api/socketClient";

/**
 * Lấy lịch sử tin nhắn.
 * @param {string} name
 * @param {number} page
 */
export const getPeopleChatMessages = async (name, page = 1) => {
    if (!name?.trim()) {
        throw new Error("Tên người dùng không được để trống.");
    }

    try {
        const data = await request("GET_PEOPLE_CHAT_MES", {
            name: name.trim(),
            page,
        });

        if (!Array.isArray(data)) {
            throw new Error("Dữ liệu lịch sử chat cá nhân không hợp lệ.");
        }

        return data;
    } catch (error) {
        console.error("[Chat API] GET_PEOPLE_CHAT_MES failed:", error);
        throw error;
    }
};

/**
 * Gửi tin nhắn.
 * @param {string} to
 * @param {string} mes
 */
export const sendPeopleChatMessage = async (to, mes) => {
    try {
        if (!to || !mes?.trim()) {
            throw new Error(
                "Người nhận và nội dung tin nhắn không được để trống."
            );
        }

        const trimmedMessage = mes.trim();

        await send("SEND_CHAT", {
            type: "people",
            to,
            mes: trimmedMessage,
        });

        return {
            to,
            mes: trimmedMessage,
        };
    } catch (error) {
        console.error("[Chat API] SEND_CHAT failed:", error);
        throw error;
    }
};

/**
 * Lấy lịch sử tin nhắn nhóm.
 * @param {string} name
 * @param {number} page
 */
export const getRoomChatMessages = async (name, page = 1) => {
    if (!name?.trim()) {
        throw new Error("Tên phòng không được để trống.");
    }

    try {
        const data = await request("GET_ROOM_CHAT_MES", {
            name: name.trim(),
            page,
        });

        if (!data) {
            throw new Error("Dữ liệu lịch sử chat nhóm không hợp lệ.");
        }

        console.log("[GET_ROOM_CHAT_MES] Response:", data);

        const messages = data.chatData ?? data.chatMess;

        if (!Array.isArray(messages)) {
            throw new Error("Không tìm thấy danh sách tin nhắn nhóm.");
        }

        return messages;
    } catch (error) {
        console.error("[Chat API] GET_ROOM_CHAT_MES failed:", error);
        throw error;
    }
};

/**
 * @param {string} to
 * @param {string} mes
 */
export const sendRoomChatMessage = async (to, mes) => {
    try {
        if (!to || !mes?.trim()) {
            throw new Error(
                "Room name and message cannot be empty."
            );
        }

        const trimmedMessage = mes.trim();

        await send("SEND_CHAT", {
            type: "room",
            to,
            mes: trimmedMessage,
        });

        return {
            type: "room",
            to,
            mes: trimmedMessage,
        };
    } catch (error) {
        console.error("[Chat API] SEND_CHAT room failed:", error);
        throw error;
    }
};

/**
 * Tham gia phòng chat.
 * @param {string} name
 */
export const joinRoom = async (name) => {
    try {
        const trimmedName = name?.trim();

        if (!trimmedName) {
            throw new Error("Room name cannot be empty.");
        }

        const data = await request("JOIN_ROOM", {
            name: trimmedName,
        });

        console.log("[JOIN_ROOM] Room response:", data);

        if (!data || !data.name) {
            throw new Error("Invalid room information.");
        }

        return data;
    } catch (error) {
        console.error("[Chat API] JOIN_ROOM failed:", error);
        throw error;
    }
};

export const getUserList = async () => {
    try {
        const data = await request("GET_USER_LIST", {});

        if (!Array.isArray(data)) {
            throw new Error("Dữ liệu danh sách người dùng không hợp lệ.");
        }

        return data;
    } catch (error) {
        console.error("[Chat API] GET_USER_LIST failed:", error);
        throw error;
    }
};


export const createChatRoom = async (name) => {
    try {
        const trimmedName = name?.trim();

        if (!trimmedName) {
            throw new Error("Tên nhóm không được để trống.");
        }

        const data = await request("CREATE_ROOM", {
            name: trimmedName,
        });

        console.log("[CREATE_ROOM] Response:", data);

        if (!data) {
            throw new Error("Không thể tạo nhóm chat.");
        }

        return data;
    } catch (error) {
        console.error("[Chat API] CREATE_ROOM failed:", error);
        throw error;
    }
};
