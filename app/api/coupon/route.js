import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
// verify coupon
export const POST = async (req) => {
    try {
        const { userId, has } = await getAuth(req);
        const { code } = await req.json();
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase(), expiresAt: { gt: new Date() } },
        });
        if (!coupon) {
            return NextResponse.json(
                { error: "coupon not found!" },
                { status: 404 }
            );
        }
        if (coupon.forNewUser) {
            const orders = await prisma.order.findMany({ where: { userId } });
            if (orders.length > 0) {
                return NextResponse.json(
                    { error: "coupon valid for new user only!" },
                    { status: 400 }
                );
            }
        }
        if (coupon.forMember) {
            const isPlusMember = has({ plan: "plus" });
            if (!isPlusMember) {
                return NextResponse.json(
                    { error: "coupon valid for plus member only!" },
                    { status: 400 }
                );
            }
        }
        return NextResponse.json({
            coupon,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json()(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
