const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Helper to clean environment variables (strip quotes and whitespace)
const cleanEnvVar = (val) => {
  if (typeof val !== 'string') return val;
  return val.replace(/^["']|["']$/g, '').trim();
};

const cloudName = cleanEnvVar(process.env.CLOUD_NAME);
const apiKey = cleanEnvVar(process.env.CLOUD_API_KEY);
const apiSecret = cleanEnvVar(process.env.CLOUD_API_SECRET);

if (!cloudName || !apiKey || !apiSecret) {
  console.warn("WARNING: Cloudinary environment variables are not fully set! Image uploads will fail.");
  console.log("DIAGNOSTICS:");
  console.log("- CLOUD_NAME:", cloudName ? "✅ Detected" : "❌ Missing");
  console.log("- CLOUD_API_KEY:", apiKey ? "✅ Detected" : "❌ Missing");
  console.log("- CLOUD_API_SECRET:", apiSecret ? "✅ Detected (Masked)" : "❌ Missing");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_DEV',
    allowedFormats: ["png", "jpg", "jpeg", "heic", "webp", "avif"]
  }
});

module.exports = {
  cloudinary,
  storage,
}