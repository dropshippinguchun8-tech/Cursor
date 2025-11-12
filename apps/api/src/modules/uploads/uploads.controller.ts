import { Body, Controller, Post } from "@nestjs/common";
import { UploadsService } from "./uploads.service";
import { CreatePresignDto } from "./dto/create-presign.dto";

@Controller("api/uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("presign")
  async presign(@Body() dto: CreatePresignDto) {
    return this.uploadsService.createPresignedUpload(dto.filename, dto.contentType, dto.size);
  }
}
