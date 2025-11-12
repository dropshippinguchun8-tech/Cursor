import { Body, Controller, Headers, Ip, Post } from "@nestjs/common";
import { ClicksService } from "./clicks.service";
import { CreateClickDto } from "./dto/create-click.dto";
import { Public } from "../../common/decorators/public.decorator";

@Controller("api/clicks")
export class ClicksController {
  constructor(private readonly clicksService: ClicksService) {}

  @Public()
  @Post()
  async create(
    @Body() dto: CreateClickDto,
    @Ip() ip: string,
    @Headers("user-agent") userAgent: string,
    @Headers("referer") referer: string
  ) {
    return this.clicksService.create(dto, ip, userAgent, referer);
  }
}
