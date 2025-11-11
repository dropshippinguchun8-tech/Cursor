import { Injectable } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Injectable()
export class JwtBlacklistService {
  private readonly prefix = "jwt:blacklist:";

  constructor(private readonly redisService: RedisService) {}

  async blacklist(tokenId: string, ttlSeconds: number) {
    await this.redisService.set(`${this.prefix}${tokenId}`, "1", ttlSeconds);
  }

  async isBlacklisted(tokenId: string): Promise<boolean> {
    const result = await this.redisService.get(`${this.prefix}${tokenId}`);
    return result === "1";
  }
}
