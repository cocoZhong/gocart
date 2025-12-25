import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { authAdmin } from "@/middlewares/authAdmin";
import { inngest } from "@/inngest/client";
// add new coupon
export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        const { coupon } = await req.json();
        coupon.code = coupon.code.toUpperCase();
        await prisma.coupon.create({ data: coupon }).then(async (coupon) => {
            // run inngest scheduler function to delete coupon on expires
            await inngest.send({
                name: "app/coupon.expired",
                data: {
                    code: coupon.code,
                    expires_at: coupon.expiresAt,
                },
            });
        });
        return NextResponse.json({ message: "Coupon added successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
// /api/coupon?id=couponId
export const DELETE = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        const { searchParams } = req.nextUrl;
        const code = searchParams.get("code");
        await prisma.coupon.delete({
            where: { code },
        });
        return NextResponse.json({ message: "Coupon deleted successfully!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
// get list of coupons
export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        const coupons = await prisma.coupon.findMany();
        return NextResponse.json({ coupons });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
