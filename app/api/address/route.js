import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
// add new address
export const POST = async (req) => {
    try {
        const { userId } = await getAuth(req);
        const { address } = await req.json();
        address.userId = userId;
        const newAddress = await prisma.address.create({
            data: address,
        });
        return NextResponse.json({
            address: newAddress,
            message: "Address added successfully",
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
// get all addresses for a user
export const GET = async (req) => {
    try {
        const { userId } = await getAuth(req);
        const addresses = await prisma.address.findMany({
            where: { userId },
        });
        return NextResponse.json({
            addresses,
            message: "Addresses fetched successfully",
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
