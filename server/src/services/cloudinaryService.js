import cloudinary from "../config/cloudinary.js";

const uploadImage = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `tome21/${folder}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            image_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      },
    );

    stream.end(fileBuffer);
  });
};

export default uploadImage;