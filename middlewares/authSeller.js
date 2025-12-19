export const authSeller = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                store: true,
            },
        });
        if (user.store && user.store.status === "approved") {
            return user.store.id;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};
