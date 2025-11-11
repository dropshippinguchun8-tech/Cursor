/* eslint-disable no-console */
import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CPAMaRKeT.Uz database...");

  await prisma.notification.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.click.deleteMany();
  await prisma.creative.deleteMany();
  await prisma.product.deleteMany();
  await prisma.offer.deleteMany();
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

  const operator = await prisma.user.create({
    data: {
      email: "operator@cpamarket.uz",
      username: "operator",
      passwordHash,
      role: UserRole.operator,
      status: "active",
      profile: {
        create: {
          fullName: "Operator Team"
        }
      }
    }
  });

  const targetolog = await prisma.user.create({
    data: {
      email: "targetolog@cpamarket.uz",
      username: "targetolog",
      passwordHash,
      role: UserRole.targetolog,
      status: "active",
      profile: {
        create: {
          fullName: "Targetolog Pro"
        }
      }
    }
  });

  const advertiser = await prisma.user.create({
    data: {
      email: "advertiser@cpamarket.uz",
      username: "advertiser",
      passwordHash,
      role: UserRole.advertiser,
      status: "active",
      profile: {
        create: {
          fullName: "Advertiser Team"
        }
      }
    }
  });

  const affiliate1 = await prisma.user.create({
    data: {
      email: "affiliate1@cpamarket.uz",
      username: "affiliate1",
      passwordHash,
      role: UserRole.affiliate,
      status: "active",
      profile: {
        create: {
          fullName: "Affiliate One"
        }
      }
    }
  });

  const affiliate2 = await prisma.user.create({
    data: {
      email: "affiliate2@cpamarket.uz",
      username: "affiliate2",
      passwordHash,
      role: UserRole.affiliate,
      status: "active",
      profile: {
        create: {
          fullName: "Affiliate Two"
        }
      }
    }
  });

  const offers = await prisma.offer.createMany({
    data: [
      {
        title: "Fintech Loan Offer",
        description: "High converting loan offer for CIS region",
        payout: 25,
        link: "https://cpamarket.uz/offers/fintech",
        advertiserId: advertiser.id,
        vertical: "Finance",
        geo: "UZ",
        dailyCap: 100
      },
      {
        title: "E-commerce Gadget Sale",
        description: "Electronics gadgets affiliate program",
        payout: 15,
        link: "https://cpamarket.uz/offers/gadgets",
        advertiserId: advertiser.id,
        vertical: "E-commerce",
        geo: "UZ",
        dailyCap: 250
      },
      {
        title: "Education Accredited Course",
        description: "Online course lead generation",
        payout: 30,
        link: "https://cpamarket.uz/offers/education",
        advertiserId: advertiser.id,
        vertical: "Education",
        geo: "RU",
        dailyCap: 120
      }
    ]
  });

  const createdOffers = await prisma.offer.findMany({
    where: { advertiserId: advertiser.id }
  });

  await prisma.product.createMany({
    data: [
      {
        title: "SmartWatch Pro",
        sku: "SW-001",
        price: 199,
        currency: "USD",
        stock: 50,
        images: [],
        ownerId: advertiser.id,
        offerId: createdOffers[1].id
      },
      {
        title: "Fitness Tracker",
        sku: "FT-101",
        price: 99,
        currency: "USD",
        stock: 120,
        images: [],
        ownerId: advertiser.id,
        offerId: createdOffers[1].id
      },
      {
        title: "Premium Course Bundle",
        sku: "EDU-202",
        price: 299,
        currency: "USD",
        stock: 999,
        images: [],
        ownerId: advertiser.id,
        offerId: createdOffers[2].id
      }
    ]
  });

  await prisma.creative.createMany({
    data: [
      {
        offerId: createdOffers[0].id,
        type: "banner",
        url: "https://cdn.cpamarket.uz/creatives/fintech-banner.png",
        ownerId: targetolog.id
      },
      {
        offerId: createdOffers[1].id,
        type: "video",
        url: "https://cdn.cpamarket.uz/creatives/gadget-video.mp4",
        ownerId: targetolog.id
      },
      {
        offerId: createdOffers[2].id,
        type: "text",
        url: "Enroll now and get 20% off",
        ownerId: targetolog.id
      }
    ]
  });

  const clickSeed = [];
  for (let i = 0; i < 20; i++) {
    clickSeed.push({
      offerId: createdOffers[i % createdOffers.length].id,
      userId: i % 2 === 0 ? affiliate1.id : affiliate2.id,
      ip: `192.168.1.${i}`,
      userAgent: "Mozilla/5.0",
      referer: "https://partner.landing.com",
      subId: `sub${i}`
    });
  }
  await prisma.click.createMany({ data: clickSeed });

  const leadSeed = [];
  for (let i = 0; i < 10; i++) {
    leadSeed.push({
      offerId: createdOffers[i % createdOffers.length].id,
      userId: i % 2 === 0 ? affiliate1.id : affiliate2.id,
      status: i % 3 === 0 ? "approved" : "pending",
      revenue: i % 3 === 0 ? 25 : 0,
      txId: `TX-${1000 + i}`,
      meta: {},
      approvedAt: i % 3 === 0 ? new Date() : null
    });
  }
  await prisma.lead.createMany({ data: leadSeed });

  await prisma.payout.createMany({
    data: [
      {
        affiliateId: affiliate1.id,
        period: "2025-01",
        amount: 250,
        status: "paid",
        paidAt: addDays(new Date(), -10)
      },
      {
        affiliateId: affiliate2.id,
        period: "2025-01",
        amount: 180,
        status: "pending"
      }
    ]
  });

  await prisma.campaign.create({
    data: {
      name: "Spring Gadget Campaign",
      budget: 1500,
      bid: 2.5,
      startAt: addDays(new Date(), -7),
      endAt: addDays(new Date(), 21),
      status: "active",
      targetologId: targetolog.id
    }
  });

  await prisma.ticket.create({
    data: {
      subject: "Need new creatives",
      body: "Please upload fresh banners for the gadget offer.",
      authorId: affiliate1.id,
      assigneeId: operator.id,
      status: "in_progress"
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: affiliate1.id,
        type: "offer",
        payload: { message: "New gadget offer launched" }
      },
      {
        userId: advertiser.id,
        type: "payout",
        payload: { message: "Monthly payout summary ready" }
      }
    ]
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
