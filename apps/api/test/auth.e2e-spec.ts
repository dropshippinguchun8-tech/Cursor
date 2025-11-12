import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/lib/prisma.service";

process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/cpamarket?schema=public";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    );
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("registers a new user", async () => {
    const csrf = await request(app.getHttpServer()).get("/api/auth/csrf").expect(200);
    const csrfToken = csrf.body.data.token;
    const cookie = csrf.headers["set-cookie"];

    const response = await request(app.getHttpServer())
      .post("/api/auth/register")
      .set("Cookie", cookie)
      .set("x-csrf-token", csrfToken)
      .send({
        username: "testuser",
        fullName: "Test User",
        email: "test@example.com",
        password: "Password123",
        role: "affiliate"
      })
      .expect(201);

    expect(response.body.data.email).toBe("test@example.com");
  });

  it("logs in with valid credentials", async () => {
    await prisma.user.update({
      where: { email: "test@example.com" },
      data: { status: "active" }
    });

    const csrf = await request(app.getHttpServer()).get("/api/auth/csrf").expect(200);
    const csrfToken = csrf.body.data.token;
    const cookie = csrf.headers["set-cookie"];

    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .set("Cookie", cookie)
      .set("x-csrf-token", csrfToken)
      .send({
        email: "test@example.com",
        password: "Password123"
      })
      .expect(201);

    expect(response.body.data.accessToken).toBeDefined();
  });
});
