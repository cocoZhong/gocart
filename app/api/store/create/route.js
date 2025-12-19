import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { imageKit, toFile } from "@/configs/imageKit";
import prisma from "@/lib/prisma";

export const POST = async (req) => {
    try {
        //  get userId and form data
        const { userId } = await getAuth(req);
        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const username = formData.get("username");
        const address = formData.get("address");
        const image = formData.get("image");
        const email = formData.get("email");
        const contact = formData.get("contact");
        // check form data is valid
        if (
            !name ||
            !description ||
            !username ||
            !address ||
            !image ||
            !email ||
            !contact
        )
            return NextResponse.json(
                { error: "missing store info" },
                { status: 400 }
            );
        // check if user has a store
        const store = await prisma.store.findFirst({
            where: {
                userId,
            },
        });
        if (store) return NextResponse.json({ status: store.status });

        // check if username is taken
        const isUserNameTaken = await prisma.store.findFirst({
            where: {
                username: username.toLowerCase(),
            },
        });
        if (isUserNameTaken)
            return NextResponse.json(
                { error: "username already taken" },
                { status: 400 }
            );
        // image upload to imageKit
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imageKit.files.upload({
            file: await toFile(buffer, "file"),
            fileName: image.name,
            folder: "logos",
        });
        const optimizedImage = await imageKit.helper.buildSrc({
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            src: response.filePath,
            transformation: [
                { quality: "auto" },
                { format: "webp" },
                { width: "512" },
            ],
        });
        // create store
        const newStore = await prisma.store.create({
            data: {
                name,
                description,
                username: username.toLowerCase(),
                address,
                logo: optimizedImage,
                email,
                contact,
                userId,
            },
        });
        // link user to store
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                store: {
                    connect: {
                        id: newStore.id,
                    },
                },
            },
        });
        return NextResponse.json({ message: "applied, waiting for approval!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
// check if user has already registered store
export const GET = async (req) => {
    try {
        const { userId } = await getAuth(req);
        const store = await prisma.store.findFirst({
            where: {
                userId,
            },
        });
        if (store) return NextResponse.json({ status: store.status });
        return NextResponse.json({ status: "not registered!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
