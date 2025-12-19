import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

// get dashboard data for admin(total orders, total stores, total products, total revenue)
export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        const orders = await prisma.order.count();
        const stores = await prisma.store.count();
        const products = await prisma.product.count();
        const allOrders = await prisma.order.findMany({
            select: {
                total: true,
                createdAt: true,
            },
        });
        const revenue = allOrders
            .reduce((acc, order) => acc + order.total, 0)
            .toFixed(2);
        const dashboardData = {
            orders,
            stores,
            products,
            revenue,
            allOrders,
        };
        return NextResponse.json({
            dashboardData,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
