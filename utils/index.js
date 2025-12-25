import { useAuth } from "@clerk/nextjs";
export const getHeader = async () => {
    const header = { headers: { Authorization: "" } };
    try {
        const { getToken } = useAuth();
        const token = await getToken();
        header.headers.Authorization = `Bearer ${token}`;
        return header;
    } catch (error) {
        return header;
    }
};
