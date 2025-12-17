import prisma from "@/lib/prisma";
import { inngest } from "./client";

// inngest user function to save user data to database
export const syncUserCreation = inngest.createFunction(
    { id: "sync-user-create" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        const { data } = event;
        await prisma.user.create({
            data: {
                id: data.id,
                name: `${data.first_name} ${data.last_name}`,
                email: data.email_addresses
                    ? data.email_addresses[0].email_address
                    : "",
                image: data.image_url,
            },
        });
    }
);
export const syncUserUpdation = inngest.createFunction(
    { id: "sync-user-update" },
    { event: "clerk/user.updated" },
    async ({ event, step }) => {
        const { data } = event;

        await prisma.user.update({
            where: {
                id: data.id,
            },
            data: {
                name: `${data.first_name} ${data.last_name}`,
                email: data.email_addresses
                    ? data.email_addresses[0].email_address
                    : "",
                image: data.image_url,
            },
        });
    }
);
export const syncUserDeletion = inngest.createFunction(
    { id: "sync-user-delete" },
    { event: "clerk/user.deleted" },
    async ({ event, step }) => {
        const { data } = event;

        await prisma.user.delete({
            where: {
                id: data.id,
            },
        });
    }
);
