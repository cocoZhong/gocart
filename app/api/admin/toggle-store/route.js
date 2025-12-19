import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

// toggle store isActive
export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        const { storeId } = await req.json();
        if (!storeId)
            return NextResponse.json(
                { message: "Store ID is required" },
                { status: 400 }
            );
        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });
        if (!store)
            return NextResponse.json(
                { message: "Store does not exist" },
                { status: 400 }
            );
        await prisma.store.update({
            where: { id: storeId },
            data: { isActive: !store.isActive },
        });
        return NextResponse.json({ message: "Store updated successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
