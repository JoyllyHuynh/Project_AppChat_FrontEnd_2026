
import { request, send } from "../../../services/api/socketClient";

/**
 * Lấy lịch sử tin nhắn.
 * @param {string} name
 * @param {number} page
 */
export const getPeopleChatMessages = async (name, page = 1) => {
    try {
        if (!name) {
            throw new Error("Tên người dùng không được để trống.");
        }

        const data = await request("GET_PEOPLE_CHAT_MES", {
            name,
            page,
        });

        if (!Array.isArray(data)) {
            throw new Error("Dữ liệu lịch sử tin nhắn không hợp lệ.");
        }

        return data;
    } catch (error) {
        console.error(
            "[Chat API] GET_PEOPLE_CHAT_MES failed:",
            error
        );

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
    try {
        if (!name) {
            throw new Error("Room name cannot be empty.");
        }

        const data = await request("GET_ROOM_CHAT_MES", {
            name,
            page,
        });

        console.log("[GET_ROOM_CHAT_MES] Room response:", data);
        console.log("[GET_ROOM_CHAT_MES] Chat data:", data?.chatData);

        if (!data || !Array.isArray(data.chatData)) {
            throw new Error("Invalid room message history.");
        }

        return data.chatData;
    } catch (error) {
        console.error(
            "[Chat API] GET_ROOM_CHAT_MES failed:",
            error
        );

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

