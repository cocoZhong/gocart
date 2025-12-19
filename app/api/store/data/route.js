import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// get store info and store product
export const POST = async (req) => {
    try {
        // get store username from params
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username").toLowerCase();
        if (!username)
            return NextResponse.json(
                { error: "missing store username" },
                { status: 400 }
            );
        //get store info and inStock products with ratings
        const storeInfo = await prisma.store.findUnique({
            where: { username, isActive: true },
            include: {
                Product: {
                    include: { rating: true },
                },
            },
        });
        if (!storeInfo) {
            return NextResponse.json(
                { message: "Store not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({ storeInfo });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};
