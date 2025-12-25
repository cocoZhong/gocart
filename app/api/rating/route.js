import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// add new rating
export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const { rating, review, productId, orderId } = await req.json();
        // check if order exists
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
                userId,
            },
        });
        if (!order)
            return NextResponse.json(
                { error: "order not found" },
                { status: 404 }
            );
        // check if rating exists
        const isAlreadyRated = await prisma.rating.findFirst({
            where: {
                orderId,
                productId,
            },
        });
        if (isAlreadyRated)
            return NextResponse.json(
                { error: "rating already exists" },
                { status: 400 }
            );
        // create rating
        const response = await prisma.rating.create({
            data: {
                rating,
                review,
                productId,
                orderId,
                userId,
            },
        });
        return NextResponse.json({
            message: "Rating added successfully",
            rating: response,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};

// get all ratings for a user
export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const ratings = await prisma.rating.findMany({
            where: {
                userId,
            },
        });
        return NextResponse.json({ ratings });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
