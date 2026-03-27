"use server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cacheLife } from "next/cache";
import { s3 } from ".";

function revalidatePeriod() {
  switch (process.env.NODE_ENV) {
    case "development":
      return 60;
    case "production":
      return 604800;
    case "test":
      return 60;
  }
}

export async function getObject(key: string) {
  "use cache";
  cacheLife({ revalidate: revalidatePeriod() });
  if (process.env.NODE_ENV == "development") {
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  return await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.BUCKET_NAME!, Key: key }),
    { expiresIn: revalidatePeriod() },
  );
}
