import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { authAdmin } from "@/middlewares/authAdmin";

// auth admin
export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        return NextResponse.json({ isAdmin });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
