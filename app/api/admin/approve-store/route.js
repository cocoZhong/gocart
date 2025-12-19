import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
// approve seller
export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        const { storeId, status } = await req.json();
        if (status === "approved") {
            await prisma.store.update({
                where: { id: storeId },
                data: { status, isActive: true },
            });
        } else if (status === "rejected") {
            await prisma.store.update({
                where: { id: storeId },
                data: { status },
            });
        }
        return NextResponse.json({ message: status + " successfully!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
// get all pending and rejected stores
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
                status: { in: ["pending", "rejected"] },
            },
            include: { user: true },
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
