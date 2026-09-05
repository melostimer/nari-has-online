import { v2 as cloudinary } from "cloudinary";

// Cloudinary yapılandırması — ortam değişkenlerinden okunur
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Base64 veya URL'den Cloudinary'e görsel yükler
 */
export async function uploadImage(source: string, folder = "narihas/products"): Promise<string> {
  const result = await cloudinary.uploader.upload(source, {
    folder,
    transformation: [
      { width: 800, height: 600, crop: "fill", gravity: "auto" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
  return result.secure_url;
}

export async function uploadSliderImage(source: string): Promise<string> {
  const result = await cloudinary.uploader.upload(source, {
    folder: "narihas/slider",
    transformation: [
      { width: 1920, height: 1080, crop: "fill", gravity: "auto" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
  return result.secure_url;
}

/**
 * Cloudinary'den görsel siler
 */
export async function deleteImage(url: string): Promise<void> {
  const publicId = url.split("/").slice(-2).join("/").replace(/\.[^.]+$/, "");
  await cloudinary.uploader.destroy(publicId);
}
