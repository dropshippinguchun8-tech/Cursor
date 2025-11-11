import { Module } from "@nestjs/common";
import { PayoutsController } from "./payouts.controller";
import { PayoutsService } from "./payouts.service";
import { PrismaService } from "../../lib/prisma.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [PayoutsController],
  providers: [PayoutsService, PrismaService],
  exports: [PayoutsService]
})
export class PayoutsModule {}
