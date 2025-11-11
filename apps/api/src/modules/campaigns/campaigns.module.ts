import { Module } from "@nestjs/common";
import { CampaignsController } from "./campaigns.controller";
import { CampaignsService } from "./campaigns.service";
import { PrismaService } from "../../lib/prisma.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [CampaignsController],
  providers: [CampaignsService, PrismaService],
  exports: [CampaignsService]
})
export class CampaignsModule {}
