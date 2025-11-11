import { Module } from "@nestjs/common";
import { LeadsController } from "./leads.controller";
import { LeadsService } from "./leads.service";
import { PrismaService } from "../../lib/prisma.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [LeadsController],
  providers: [LeadsService, PrismaService],
  exports: [LeadsService]
})
export class LeadsModule {}
