import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import { PrismaService } from "../../lib/prisma.service";

@Injectable()
export class UploadsService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
    this.bucket = this.config.get<string>("app.s3.bucket") ?? "cpamarket-assets";
    this.client = new S3Client({
      region: "us-east-1",
      endpoint: this.config.get<string>("app.s3.endpoint"),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.get<string>("app.s3.accessKey") ?? "",
        secretAccessKey: this.config.get<string>("app.s3.secretKey") ?? ""
      }
    });
  }

  async createPresignedUpload(filename: string, contentType: string, size: number) {
    const key = `${uuid()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ACL: "public-read"
    });

    const url = await getSignedUrl(this.client, command, { expiresIn: 60 * 5 });

    await this.prisma.fileObject.create({
      data: {
        key,
        url: `${this.config.get<string>("app.s3.endpoint")}/${this.bucket}/${key}`,
        bucket: this.bucket,
        mimeType: contentType,
        size
      }
    });

    return {
      uploadUrl: url,
      key
    };
  }
}
