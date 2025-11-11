import { Module } from "@nestjs/common";
import { ClicksController } from "./clicks.controller";
import { ClicksService } from "./clicks.service";
import { PrismaService } from "../../lib/prisma.service";

@Module({
  controllers: [ClicksController],
  providers: [ClicksService, PrismaService],
  exports: [ClicksService]
})
export class ClicksModule {}
