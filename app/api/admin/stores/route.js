import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
// get all approved stores
export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        const stores = await prisma.store.findMany({
            where: {
                status: "approved",
            },
            include: {
                user: true,
            },
        });
        return NextResponse.json({ stores });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
