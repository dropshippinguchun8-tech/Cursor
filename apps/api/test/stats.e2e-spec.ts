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
  let targetologistToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.leadStatusLog.deleteMany();
    await prisma.balanceTransaction.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    const targetologist = await prisma.user.create({
      data: {
        email: "tg@test.com",
        username: "tg",
        passwordHash: await argon2.hash("Password123"),
        role: "targetologist",
        status: "active",
        referralCode: "test-ref"
      }
    });

    const operator = await prisma.user.create({
      data: {
        email: "op@test.com",
        username: "op",
        passwordHash: await argon2.hash("Password123"),
        role: "operator",
        status: "active"
      }
    });

    const product = await prisma.product.create({
      data: {
        title: "Demo Product",
        sku: "DP-01",
        price: 100,
        currency: "USD",
        stock: 10,
        images: [],
        ownerId: targetologist.id,
        commissionTargetologist: 20,
        commissionOperator: 15
      }
    });

    await prisma.lead.create({
      data: {
        referralCode: targetologist.referralCode!,
        customerName: "QA Test",
        customerPhone: "+998900000000",
        targetologistId: targetologist.id,
        operatorId: operator.id,
        productId: product.id,
        commissionTargetologist: product.commissionTargetologist,
        commissionOperator: product.commissionOperator,
        status: "SOLD",
        statusLogs: {
          create: [
            { newStatus: "NEW", comment: "Created for stats test" },
            { newStatus: "OPERATOR_ASSIGNED", previousStatus: "NEW", userId: operator.id, comment: "Claimed" },
            { newStatus: "SOLD", previousStatus: "OPERATOR_ASSIGNED", userId: operator.id, comment: "Closed" }
          ]
        }
      }
    });

    const csrf = await request(app.getHttpServer()).get("/api/auth/csrf").expect(200);
    const csrfToken = csrf.body.data.token;
    const cookie = csrf.headers["set-cookie"];

    const login = await request(app.getHttpServer())
      .post("/api/auth/login")
      .set("Cookie", cookie)
      .set("x-csrf-token", csrfToken)
      .send({ email: targetologist.email, password: "Password123" })
      .expect(201);

    targetologistToken = login.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("returns totals for targetologist", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/stats/totals")
        .set("Authorization", `Bearer ${targetologistToken}`)
        .expect(200);

    expect(response.body.data.leads).toBeGreaterThan(0);
    expect(response.body.data.revenue).toBeGreaterThan(0);
  });
});
