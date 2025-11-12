/* eslint-disable no-console */
import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CPAMaRKeT.Uz database...");

  await prisma.balanceTransaction.deleteMany();
  await prisma.leadStatusLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.product.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash("Admin123!");

  const admin = await prisma.user.create({
    data: {
      email: "admin@cpamarket.uz",
      username: "admin",
      passwordHash,
      role: UserRole.admin,
      status: "active",
      profile: {
        create: {
          fullName: "Admin CPAMarket",
          language: "uz"
        }
      }
    }
  });

  const targetologist = await prisma.user.create({
    data: {
      email: "targetolog@cpamarket.uz",
      username: "targetolog",
      passwordHash,
      role: UserRole.targetologist,
      status: "active",
      referralCode: "tg-demo",
      profile: {
        create: {
          fullName: "Targetologist Demo"
        }
      }
    }
  });

  const operator = await prisma.user.create({
    data: {
      email: "operator@cpamarket.uz",
      username: "operator",
      passwordHash,
      role: UserRole.operator,
      status: "active",
      profile: {
        create: {
          fullName: "Operator Demo"
        }
      }
    }
  });

  const client = await prisma.user.create({
    data: {
      email: "client@cpamarket.uz",
      username: "client",
      passwordHash,
      role: UserRole.client,
      status: "active",
      profile: {
        create: {
          fullName: "Client Demo"
        }
      }
    }
  });

  const product = await prisma.product.create({
    data: {
      title: "Premium Water Filter",
      sku: "WF-001",
      price: 149,
      currency: "USD",
      stock: 100,
      images: [],
      ownerId: admin.id,
      commissionTargetologist: 20,
      commissionOperator: 15
    }
  });

  const newLead = await prisma.lead.create({
    data: {
        referralCode: targetologist.referralCode!,
      customerName: "Bekzod Yusupov",
      customerPhone: "+998901112233",
      customerEmail: "bekzod@example.com",
        targetologistId: targetologist.id,
      productId: product.id,
      commissionTargetologist: product.commissionTargetologist,
      commissionOperator: product.commissionOperator,
      statusLogs: {
        create: [
          {
            newStatus: "NEW",
            comment: "Lead created from referral form"
          }
        ]
      }
    }
  });

  const assignedLead = await prisma.lead.create({
    data: {
        referralCode: targetologist.referralCode!,
      customerName: "Dilnoza Karimova",
      customerPhone: "+998907778899",
        targetologistId: targetologist.id,
      operatorId: operator.id,
      productId: product.id,
      commissionTargetologist: product.commissionTargetologist,
      commissionOperator: product.commissionOperator,
      status: "OPERATOR_ASSIGNED",
      statusLogs: {
        create: [
          {
            newStatus: "NEW",
            comment: "Lead created via landing"
          },
          {
            newStatus: "OPERATOR_ASSIGNED",
            previousStatus: "NEW",
          userId: operator.id,
            comment: "Lead claimed by operator"
          }
        ]
      }
    }
  });

  const acceptedLead = await prisma.lead.create({
    data: {
        referralCode: targetologist.referralCode!,
      customerName: "Javlon Sodiqov",
      customerPhone: "+998935551122",
        targetologistId: targetologist.id,
      operatorId: operator.id,
      productId: product.id,
      commissionTargetologist: product.commissionTargetologist,
      commissionOperator: product.commissionOperator,
      status: "ACCEPTED",
      statusLogs: {
        create: [
          {
            newStatus: "NEW",
            comment: "Lead captured during webinar"
          },
          {
            newStatus: "OPERATOR_ASSIGNED",
            previousStatus: "NEW",
          userId: operator.id,
            comment: "Operator assigned"
          },
          {
            newStatus: "ACCEPTED",
            previousStatus: "OPERATOR_ASSIGNED",
          userId: operator.id,
            comment: "Client confirmed availability"
          }
        ]
      }
    }
  });

  const soldLead = await prisma.lead.create({
    data: {
        referralCode: targetologist.referralCode!,
      customerName: "Madina Ergasheva",
      customerPhone: "+998901234567",
        targetologistId: targetologist.id,
      operatorId: operator.id,
      clientId: client.id,
      productId: product.id,
      commissionTargetologist: product.commissionTargetologist,
      commissionOperator: product.commissionOperator,
      status: "SOLD",
      statusLogs: {
        create: [
          {
            newStatus: "NEW",
            comment: "Lead captured"
          },
          {
            newStatus: "OPERATOR_ASSIGNED",
            previousStatus: "NEW",
          userId: operator.id,
            comment: "Operator claimed the lead"
          },
          {
            newStatus: "ACCEPTED",
            previousStatus: "OPERATOR_ASSIGNED",
          userId: operator.id,
            comment: "Client confirmed order"
          },
          {
            newStatus: "SENT",
            previousStatus: "ACCEPTED",
          userId: admin.id,
            comment: "Order dispatched"
          },
          {
            newStatus: "SOLD",
            previousStatus: "SENT",
          userId: admin.id,
            comment: "Order delivered and paid"
          }
        ]
      }
    }
  });

    await prisma.user.update({
      where: { id: targetologist.id },
      data: { holdBalance: product.commissionTargetologist }
    });

    await prisma.user.update({
      where: { id: operator.id },
      data: { holdBalance: product.commissionOperator }
    });

    await prisma.balanceTransaction.createMany({
    data: [
      {
        userId: targetologist.id,
        leadId: soldLead.id,
        amount: product.commissionTargetologist,
        status: "hold",
        type: "credit",
        reason: "Commission awaiting admin approval"
      },
      {
        userId: operator.id,
        leadId: soldLead.id,
        amount: product.commissionOperator,
        status: "hold",
        type: "credit",
        reason: "Commission awaiting admin approval"
      }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: operator.id,
        type: "system",
        payload: { message: "New lead available in the queue." }
      },
      {
        userId: targetologist.id,
        type: "system",
        payload: { message: "Your referral link: https://cpamarket.uz/lead/tg-demo" }
      }
    ]
  });

  console.log("Seeded leads:", {
    newLead: newLead.id,
    assignedLead: assignedLead.id,
    acceptedLead: acceptedLead.id,
    soldLead: soldLead.id
  });

  console.log("✅ Seed completed.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
