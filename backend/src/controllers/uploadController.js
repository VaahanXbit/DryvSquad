const { v2: cloudinary } = require('cloudinary');

const isCloudinaryConfigured = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

exports.uploadImage = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please choose an image file to upload.' });
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({ success: false, message: 'Image uploads are not configured. Add the Cloudinary environment variables to enable them.' });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'dryvsquad/articles', resource_type: 'image' },
        (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
      );
      stream.end(req.file.buffer);
    });
    return res.status(201).json({ success: true, message: 'Image uploaded successfully.', url: result.secure_url });
  } catch (error) {
    return next(error);
  }
};
