import { Module } from "@nestjs/common";
import { BalancesService } from "./balances.service";
import { BalancesController } from "./balances.controller";
import { PrismaService } from "../../lib/prisma.service";

@Module({
  controllers: [BalancesController],
  providers: [BalancesService, PrismaService],
  exports: [BalancesService]
})
export class BalancesModule {}
