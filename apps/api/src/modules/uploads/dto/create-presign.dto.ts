import { IsInt, IsString, Min } from "class-validator";

export class CreatePresignDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;

  @IsInt()
  @Min(1)
  size: number;
}
