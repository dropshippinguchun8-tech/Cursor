import { Module } from "@nestjs/common";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";
import { PrismaService } from "../../lib/prisma.service";

@Module({
  controllers: [StatsController],
  providers: [StatsService, PrismaService],
  exports: [StatsService]
})
export class StatsModule {}
