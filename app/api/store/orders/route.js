import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { authSeller } from "@/middlewares/authSeller";
import { NextResponse } from "next/server";
// update seller order status

export const POST = async (req) => {
    try {
        const { userId } = await getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        const { orderId, status } = await req.json();
        await prisma.order.update({
            where: { id: orderId, storeId },
            data: { status },
        });
        return NextResponse.json(
            { message: "Order status updated successfully!" },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
// get all orders for seller
export const GET = async (req) => {
    try {
        const { userId } = await getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        const orders = await prisma.order.findMany({
            where: { storeId },
            include: {
                user: true,
                address: true,
                orderItems: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ orders });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
