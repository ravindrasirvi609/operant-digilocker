import AWS from "aws-sdk";

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET_NAME || "operant-digilocker";

/**
 * Upload a file to S3
 * @param fileKey The key to save the file as
 * @param fileContent The content of the file
 * @param contentType The content type of the file
 */
export const uploadToS3 = async (
  fileKey: string,
  fileContent: Buffer,
  contentType: string
): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: fileContent,
    ContentType: contentType,
    ACL: "public-read",
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

/**
 * Get a file from S3
 * @param fileKey The key of the file to get
 */
export const getFileFromS3 = async (fileKey: string): Promise<Buffer> => {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  try {
    const data = await s3.getObject(params).promise();
    return data.Body as Buffer;
  } catch (error) {
    console.error("Error getting file from S3:", error);
    throw error;
  }
};
