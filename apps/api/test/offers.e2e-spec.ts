import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/lib/prisma.service";
import * as argon2 from "argon2";

process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/cpamarket?schema=public";

describe("OffersController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let advertiserToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.lead.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.user.deleteMany();

    const advertiser = await prisma.user.create({
      data: {
        email: "advertiser@test.com",
        username: "adv",
        passwordHash: await argon2.hash("Password123"),
        role: "advertiser",
        status: "active"
      }
    });

    const csrf = await request(app.getHttpServer()).get("/api/auth/csrf").expect(200);
    const csrfToken = csrf.body.data.token;
    const cookie = csrf.headers["set-cookie"];

    const login = await request(app.getHttpServer())
      .post("/api/auth/login")
      .set("Cookie", cookie)
      .set("x-csrf-token", csrfToken)
      .send({ email: advertiser.email, password: "Password123" })
      .expect(201);

    advertiserToken = login.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("creates an offer", async () => {
    const csrf = await request(app.getHttpServer()).get("/api/auth/csrf").expect(200);
    const csrfToken = csrf.body.data.token;
    const cookie = csrf.headers["set-cookie"];

    const response = await request(app.getHttpServer())
      .post("/api/offers")
      .set("Authorization", `Bearer ${advertiserToken}`)
      .set("Cookie", cookie)
      .set("x-csrf-token", csrfToken)
      .send({
        title: "Test Offer",
        description: "Offer description",
        payout: "15",
        link: "https://example.com",
        vertical: "Finance",
        geo: "UZ"
      })
      .expect(201);

    expect(response.body.data.title).toBe("Test Offer");
  });

  it("lists offers with pagination", async () => {
    const csrf = await request(app.getHttpServer()).get("/api/auth/csrf").expect(200);
    const csrfToken = csrf.body.data.token;
    const cookie = csrf.headers["set-cookie"];

    const response = await request(app.getHttpServer())
      .get("/api/offers?page=1&limit=10")
      .set("Authorization", `Bearer ${advertiserToken}`)
      .set("Cookie", cookie)
      .set("x-csrf-token", csrfToken)
      .expect(200);

    expect(Array.isArray(response.body.data.data)).toBe(true);
  });
});
