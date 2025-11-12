import { Module } from "@nestjs/common";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";
import { PrismaService } from "../../lib/prisma.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService],
  exports: [TicketsService]
})
export class TicketsModule {}
