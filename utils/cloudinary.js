const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.handleUpload = async (file, type) => {
  const b64 = Buffer.from(file.buffer).toString('base64');
  const dataURI = 'data:' + file.mimetype + ';base64,' + b64;

  const uploadedMedia = await cloudinary.uploader.upload(dataURI, {
    resource_type: type,
  });
  const { url } = uploadedMedia;
  return url;
};
