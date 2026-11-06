
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
