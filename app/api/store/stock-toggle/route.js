// toggle stock of a product
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
export const POST = async (req) => {
    try {
        const { userId } = await getAuth(req);
        const { productId } = await req.json();
        if (!productId)
            return NextResponse.json(
                { error: "Missing productId!" },
                { status: 400 }
            );
        const storeId = await authSeller(userId);
        if (!storeId)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                storeId,
            },
        });
        if (!product)
            return NextResponse.json(
                { error: "Product not found!" },
                { status: 404 }
            );
        await prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                inStock: !product.inStock,
            },
        });
        return NextResponse.json({
            message: "product stock updated successfully!",
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
