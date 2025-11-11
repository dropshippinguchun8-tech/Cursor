import { Module } from "@nestjs/common";
import { CreativesController } from "./creatives.controller";
import { CreativesService } from "./creatives.service";
import { PrismaService } from "../../lib/prisma.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [CreativesController],
  providers: [CreativesService, PrismaService],
  exports: [CreativesService]
})
export class CreativesModule {}
