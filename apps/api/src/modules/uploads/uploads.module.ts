import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UploadsService } from "./uploads.service";
import { UploadsController } from "./uploads.controller";
import { PrismaService } from "../../lib/prisma.service";

@Module({
  imports: [ConfigModule],
  controllers: [UploadsController],
  providers: [UploadsService, PrismaService],
  exports: [UploadsService]
})
export class UploadsModule {}
