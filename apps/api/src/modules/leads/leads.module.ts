import { Module } from "@nestjs/common";
import { LeadsController } from "./leads.controller";
import { LeadsService } from "./leads.service";
import { PrismaService } from "../../lib/prisma.service";
import { AuditModule } from "../audit/audit.module";
import { BalancesModule } from "../balances/balances.module";

@Module({
  imports: [AuditModule, BalancesModule],
  controllers: [LeadsController],
  providers: [LeadsService, PrismaService],
  exports: [LeadsService]
})
export class LeadsModule {}
