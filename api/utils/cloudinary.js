const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'pictures',
  allowedFormats: ['jpg', 'png'],
  transformation: [{ width: 300, height: 300, crop: 'limit' }]
});

const parser = multer({ storage: storage });

module.exports = parser;
