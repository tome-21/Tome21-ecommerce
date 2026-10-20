import cloudinary from "../config/cloudinary.js";

export const uploadImage = (fileBuffer, folder) => {
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

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    console.log("No Cloudinary public_id provided");
    return;
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  console.log("Cloudinary deletion result:", result);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary deletion failed: ${result.result}`);
  }

  return result;
};
