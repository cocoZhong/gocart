import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { authSeller } from "@/middlewares/authSeller";
import prisma from "@/lib/prisma";
// auth seller
export const GET = async (req) => {
    try {
        const { userId } = await getAuth(req);
        const isSeller = await authSeller(userId);
        if (!isSeller)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        const storeInfo = await prisma.store.findUnique({
            where: { userId },
        });
        return NextResponse.json({ isSeller, storeInfo });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
