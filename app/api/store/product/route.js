import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { imageKit, toFile } from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
// add a new product
export const POST = async (req) => {
    try {
        // get userId
        const { userId } = await getAuth(req);
        // get storeId
        const storeId = await authSeller(userId);
        if (!storeId)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        // check if form data is valid
        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const mrp = Number(formData.get("mrp"));
        const price = Number(formData.get("price"));
        const category = formData.get("category");
        const images = formData.getAll("images");
        if (!name || !description || !mrp || !price || !category || !images) {
            return NextResponse.json(
                { error: "missing product info" },
                { status: 400 }
            );
        }
        const optimizedImages = await Promise.all(
            images.map(async (image) => {
                const buffer = Buffer.from(await image.arrayBuffer());
                const response = await imageKit.files.upload({
                    file: buffer,
                    fileName: image.name,
                    folder: "products",
                });
                const optimizedImage = await imageKit.helper.buildSrc({
                    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                    src: response.filePath,
                    transformation: [
                        { quality: "auto" },
                        { format: "webp" },
                        { width: "1024" },
                    ],
                });
                return optimizedImage;
            })
        );
        const product = await prisma.product.create({
            data: {
                name,
                description,
                mrp,
                price,
                category,
                images: optimizedImages,
                storeId,
            },
        });
        return NextResponse.json({
            message: "Product added successfully!",
            product,
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
// get all products for a seller
export const GET = async (req) => {
    try {
        const { userId } = await getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        const products = await prisma.product.findMany({
            where: {
                storeId,
            },
        });
        if (!products)
            return NextResponse.json({ message: "No products found!" });
        return NextResponse.json({ products });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
