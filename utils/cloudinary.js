const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.handleUpload = async (file, type, file_id = '') => {
  const b64 = Buffer.from(file.buffer).toString('base64');
  const dataURI = 'data:' + file.mimetype + ';base64,' + b64;

  const options = { resource_type: type };
  if (file_id) {
    (options.public_id = file_id), (options.invalidate = true);
  }

  const uploadedMedia = await cloudinary.uploader.upload(dataURI, options);
  const { secure_url, public_id } = uploadedMedia;
  return { secure_url, public_id };
};
