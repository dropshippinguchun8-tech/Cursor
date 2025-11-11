import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/lib/prisma.service";
import * as argon2 from "argon2";

process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/cpamarket?schema=public";

describe("StatsController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let affiliateToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.lead.deleteMany();
    await prisma.click.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.user.deleteMany();

    const affiliate = await prisma.user.create({
      data: {
        email: "affiliate@test.com",
        username: "aff",
        passwordHash: await argon2.hash("Password123"),
        role: "affiliate",
        status: "active"
      }
    });

    const advertiser = await prisma.user.create({
      data: {
        email: "adv@test.com",
        username: "adv",
        passwordHash: await argon2.hash("Password123"),
        role: "advertiser",
        status: "active"
      }
    });

    const offer = await prisma.offer.create({
      data: {
        title: "Stats Offer",
        description: "Test stats",
        payout: 10,
        link: "https://example.com",
        advertiserId: advertiser.id,
        vertical: "Finance",
        geo: "UZ"
      }
    });

    await prisma.click.createMany({
      data: Array.from({ length: 5 }).map(() => ({
        offerId: offer.id,
        userId: affiliate.id,
        ip: "127.0.0.1"
      }))
    });

    await prisma.lead.create({
      data: {
        offerId: offer.id,
        userId: affiliate.id,
        status: "approved",
        revenue: 10
      }
    });

    const csrf = await request(app.getHttpServer()).get("/api/auth/csrf").expect(200);
    const csrfToken = csrf.body.data.token;
    const cookie = csrf.headers["set-cookie"];

    const login = await request(app.getHttpServer())
      .post("/api/auth/login")
      .set("Cookie", cookie)
      .set("x-csrf-token", csrfToken)
      .send({ email: affiliate.email, password: "Password123" })
      .expect(201);

    affiliateToken = login.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("returns totals for affiliate", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/stats/totals")
      .set("Authorization", `Bearer ${affiliateToken}`)
      .expect(200);

    expect(response.body.data.clicks).toBeGreaterThan(0);
    expect(response.body.data.revenue).toBeGreaterThan(0);
  });
});
