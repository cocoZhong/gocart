import ImageKit, { toFile as tf } from "@imagekit/nodejs";

export const imageKit = new ImageKit({
    privateKey: process.env["IMAGEKIT_PRIVATE_KEY"], // This is the default and can be omitted
});
export const toFile = tf;
