import { request } from "../../../services/api/socketClient";

export const checkUserOnline = async (username) => {
    const data = await request("CHECK_USER_ONLINE", { user: username });
    return Boolean(data?.status);
};