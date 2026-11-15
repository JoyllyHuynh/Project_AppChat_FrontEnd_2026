export const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const validateAvatarFile = (file) => {
    if (!AVATAR_TYPES.includes(file.type)) return "Choose a PNG, JPG or WebP image.";
    if (file.size > AVATAR_MAX_BYTES) return "Image is too large. Maximum size is 2 MB.";
    return null;
};

export const resizeImageToDataUrl = (file, size = 256, quality = 0.85) =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);

            const side = Math.min(image.width, image.height);
            if (!side) {
                reject(new Error("Cannot read this image. Try another file."));
                return;
            }

            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;

            const context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, size, size);
            context.drawImage(
                image,
                (image.width - side) / 2,
                (image.height - side) / 2,
                side,
                side,
                0,
                0,
                size,
                size
            );

            resolve(canvas.toDataURL("image/jpeg", quality));
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Cannot read this image. Try another file."));
        };

        image.src = url;
    });