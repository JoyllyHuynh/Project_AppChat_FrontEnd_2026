import { request } from "../../../services/api/socketClient";

export const getUserList = async () => {
    try {
        const data = await request("GET_USER_LIST", {});

        if (!Array.isArray(data)) {
            throw new Error("Dữ liệu danh sách người dùng không hợp lệ.");
        }

        return data.map((user) => ({
            id: user.name,
            name: user.name,
            type: user.type,
            actionTime: user.actionTime,
        }));
    } catch (error) {
        console.error("[User API] GET_USER_LIST failed:", error);

        throw error;
    }
};