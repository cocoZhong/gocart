// get product list
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export const GET = async (req) => {
    try {
        const data = await prisma.product.findMany({
            where: {
                inStock: true,
            },
            include: {
                rating: {
                    select: {
                        createdAt: true,
                        rating: true,
                        review: true,
                        user: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                store: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        // remove products with store inActive false
        const products = data.filter((product) => product.store.isActive);
        return NextResponse.json({ products });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
