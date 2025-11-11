import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { PrismaService } from "../../lib/prisma.service";
import { UploadsModule } from "../uploads/uploads.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [UploadsModule, AuditModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
  exports: [ProductsService]
})
export class ProductsModule {}
