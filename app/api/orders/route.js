import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import Stripe from "stripe";
export const POST = async (req) => {
    try {
        const { userId, has } = getAuth(req);
        // check if user is authenticated
        if (!userId)
            return NextResponse.json(
                { error: "unauthorized" },
                { status: 401 }
            );
        // check order details
        const { addressId, couponCode, paymentMethod, items } =
            await req.json();
        if (
            !addressId ||
            !paymentMethod ||
            !Array.isArray(items) ||
            items.length === 0
        )
            return NextResponse.json(
                { error: "missing order details" },
                { status: 400 }
            );
        // check coupon code
        let coupon;
        if (couponCode) {
            coupon = await prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() },
            });
            if (!coupon)
                return NextResponse.json(
                    { error: "coupon not found" },
                    { status: 400 }
                );
        }
        // check coupon for new user
        if (couponCode && coupon.forNewUser) {
            const orders = await prisma.order.findMany({
                where: { userId },
            });
            if (orders.length > 0)
                return NextResponse.json(
                    { error: "coupon valid for new user" },
                    { status: 400 }
                );
        }
        // check coupon for member
        const hasPlusPlan = has({ plan: "plus" });
        if (couponCode && coupon.forMember) {
            if (!hasPlusPlan)
                return NextResponse.json(
                    { error: "coupon valid for member" },
                    { status: 400 }
                );
        }
        // group orders by storeId using a Map(users can add multiple products in the cart, and the product
        // can be from different stores and different sellers, so have to group product based on store or seller)
        const ordersByStore = new Map();
        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.id },
            });
            const storeId = product.storeId;
            if (!ordersByStore.has(storeId)) {
                ordersByStore.set(storeId, []);
            }
            ordersByStore.get(storeId).push({ ...item, price: product.price });
        }
        let orderIds = [];
        let fullAmount = 0;

        let isShippingFeeAdded = false;

        // create orders for each seller
        for (const [storeId, sellerItems] of ordersByStore.entries()) {
            let total = sellerItems.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );
            if (couponCode) total -= (total * coupon.discount) / 100;
            if (!hasPlusPlan && !isShippingFeeAdded) {
                total += 5;
                isShippingFeeAdded = true;
            }
            fullAmount += parseFloat(total.toFixed(2));
            const order = await prisma.order.create({
                data: {
                    userId,
                    storeId,
                    addressId,
                    paymentMethod,
                    total: parseFloat(total.toFixed(2)),
                    orderItems: {
                        create: sellerItems.map(({ id, quantity, price }) => ({
                            productId: id,
                            quantity,
                            price,
                        })),
                    },
                    isCouponUsed: Boolean(couponCode),
                    coupon: coupon || {},
                },
            });
            orderIds.push(order.id);
        }
        if (paymentMethod === PaymentMethod.STRIPE) {
            const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
            const origin = await req.headers.get("origin");
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: "Order",
                            },
                            unit_amount: Math.round(fullAmount * 100),
                        },
                        quantity: 1,
                    },
                ],
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
                mode: "payment",
                success_url: `${origin}/loading?nextUrl=orders`,
                cancel_url: `${origin}/cart`,
                metadata: {
                    orderIds: orderIds.join(","),
                    userId,
                    appId: "gocart",
                },
            });
            return NextResponse.json({ session });
        }
        // clear the cart
        await prisma.user.update({
            where: { id: userId },
            data: { cart: {} },
        });
        return NextResponse.json({ message: "order placed successfully!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};

// get all orders for a user
export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        // check if user is authenticated
        if (!userId)
            return NextResponse.json(
                { error: "unauthorized" },
                { status: 401 }
            );
        // get all orders for a user
        const orders = await prisma.order.findMany({
            where: {
                userId,
                OR: [
                    { paymentMethod: PaymentMethod.COD },
                    {
                        AND: [
                            { paymentMethod: PaymentMethod.STRIPE },
                            { isPaid: true },
                        ],
                    },
                ],
            },

            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
                address: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ orders });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
};
