import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
// update user cart
export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const { cart } = await req.json();
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        await prisma.user.update({
            where: { id: userId },
            data: { cart },
        });
        return NextResponse.json({ message: "Cart updated successfully!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                error: error.code || error.message,
            },
            { status: 400 }
        );
    }
};
// get user cart
export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const cart = await prisma.user.findUnique({
            where: { id: userId },
            select: { cart: true },
        });
        return NextResponse.json({ cart });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
