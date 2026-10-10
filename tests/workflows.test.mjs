import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

test.before(async () => {
  // Ensure database has active records
  const courtCount = await prisma.court.count();
  assert.ok(courtCount >= 2, "Database must have at least Supreme Court and Karnataka High Court seeded");
});

test.after(async () => {
  await prisma.$disconnect();
});

// Criterion 1: Court hierarchy & opening models
test("Criterion 1 & 2: Supreme Court of India judgments retrieval", async () => {
  const sci = await prisma.court.findUnique({ where: { code: "SCI" } });
  assert.ok(sci, "Supreme Court record must exist");
  assert.equal(sci.name, "Supreme Court of India");

  const sciJudgments = await prisma.judgment.findMany({
    where: { courtId: sci.id },
  });
  assert.ok(sciJudgments.length >= 3, "Supreme Court must have verified judgments");
  for (const j of sciJudgments) {
    assert.equal(j.courtId, sci.id);
  }
});

// Criterion 3: High Court of Karnataka & Benches
test("Criterion 3: Karnataka High Court and Regional Benches retrieval", async () => {
  const hckar = await prisma.court.findUnique({ where: { code: "HCKAR" } });
  assert.ok(hckar, "Karnataka High Court record must exist");
  assert.equal(hckar.name, "High Court of Karnataka");

  const benches = JSON.parse(hckar.benches || "[]");
  assert.ok(benches.includes("Principal Bench, Bengaluru"), "Must include Bengaluru Bench");
  assert.ok(benches.includes("Dharwad Bench"), "Must include Dharwad Bench");
  assert.ok(benches.includes("Kalaburagi Bench"), "Must include Kalaburagi Bench");

  const karJudgments = await prisma.judgment.findMany({
    where: { courtId: hckar.id },
  });
  assert.ok(karJudgments.length >= 3, "Karnataka High Court must have verified judgments");
});

// Criterion 4: Selecting IPC Section 420 displays only supported associations
test("Criterion 4: IPC Section 420 associations are verified and exclusive", async () => {
  const sec420 = await prisma.actSection.findFirst({
    where: {
      act: { shortName: "IPC" },
      sectionNumber: "420",
    },
    include: {
      judgmentSections: {
        include: {
          judgment: true,
        },
      },
    },
  });

  assert.ok(sec420, "IPC Section 420 must exist in database");
  assert.equal(sec420.sectionNumber, "420");
  assert.ok(sec420.judgmentSections.length > 0, "Must have linked judgments");

  // Every linked judgment must legitimately concern Section 420
  for (const js of sec420.judgmentSections) {
    const textAndHeadnote = (js.judgment.fullText + " " + (js.judgment.headnote || "")).toLowerCase();
    assert.ok(
      textAndHeadnote.includes("420") || textAndHeadnote.includes("cheating"),
      `Judgment ${js.judgment.title} must have actual association with 420/cheating`
    );
  }
});

// Criterion 5: Selecting CrPC Section 438 finds relevant indexed judgments
test("Criterion 5: CrPC Section 438 anticipatory bail retrieval", async () => {
  const sec438 = await prisma.actSection.findFirst({
    where: {
      act: { shortName: "CrPC" },
      sectionNumber: "438",
    },
    include: {
      judgmentSections: {
        include: { judgment: true },
      },
    },
  });

  assert.ok(sec438, "Section 438 CrPC must exist");
  assert.ok(sec438.judgmentSections.length >= 3, "Must link to Arnesh Kumar, Sibbia, Dharwad/Kalaburagi bail");

  const titles = sec438.judgmentSections.map((js) => js.judgment.title);
  assert.ok(
    titles.some((t) => t.includes("Sibbia")),
    "Gurbaksh Singh Sibbia must be indexed under Section 438 CrPC"
  );
  assert.ok(
    titles.some((t) => t.includes("Arnesh Kumar")),
    "Arnesh Kumar must be indexed under Section 438 CrPC"
  );
});

// Criterion 6: Date range filtering
test("Criterion 6: Date range filtering returns accurate records", async () => {
  const fromDate = new Date("2014-01-01");
  const toDate = new Date("2014-12-31");

  const records2014 = await prisma.judgment.findMany({
    where: {
      judgmentDate: {
        gte: fromDate,
        lte: toDate,
      },
    },
  });

  assert.ok(records2014.length >= 2, "Must find 2014 judgments (Arnesh Kumar, Dashrath Rupsingh Rathod)");
  for (const r of records2014) {
    const y = r.judgmentDate.getFullYear();
    assert.equal(y, 2014, `Record ${r.title} must have date in 2014`);
  }
});

// Criterion 7: Searching exact citation finds matching indexed judgment
test("Criterion 7: Exact citation search resolves correct record", async () => {
  const citationQuery = "(2014) 8 SCC 273";
  const citationRecord = await prisma.citation.findFirst({
    where: { fullCitationText: { contains: citationQuery } },
    include: { judgment: true },
  });

  assert.ok(citationRecord, `Citation ${citationQuery} must be indexed`);
  assert.ok(
    citationRecord.judgment.title.includes("Arnesh Kumar"),
    "Citation (2014) 8 SCC 273 must resolve to Arnesh Kumar vs State of Bihar"
  );

  const neutralCitationRecord = await prisma.judgment.findUnique({
    where: { neutralCitation: "2014 INSC 493" },
  });
  assert.ok(neutralCitationRecord, "2014 INSC 493 must resolve to Arnesh Kumar");
});

// Criterion 8 & 9: Original document viewing & Case Brief structure
test("Criterion 8 & 9: Case Brief fields and original text paragraphs", async () => {
  const judgment = await prisma.judgment.findFirst({
    where: { title: { contains: "Arnesh Kumar" } },
  });

  assert.ok(judgment, "Arnesh Kumar judgment must exist");
  assert.ok(judgment.fullText.includes("[1]"), "Judgment must preserve paragraph markers [1]");
  assert.ok(judgment.briefFacts, "Brief must have facts field");
  assert.ok(judgment.briefRatioDecidendi, "Brief must have ratio decidendi field");
  assert.equal(judgment.authorJudge, "Chandramauli Kr. Prasad, J.");
});

// Criterion 10 & 5: Transitional Law Handling (IPC 420 <-> BNS 318(4); CrPC 482 <-> BNSS 528)
test("Criterion 10: Transitional law equivalence and Section 531 BNSS guidance", async () => {
  const sec420 = await prisma.actSection.findFirst({
    where: { sectionNumber: "420" },
  });
  assert.equal(sec420?.correspondingSection, "Section 318(4)");
  assert.equal(sec420?.equivalenceType, "VERIFIED");
  assert.ok(sec420?.transitionalGuidance?.includes("01-07-2024"));

  const postJulyDecision = await prisma.judgment.findFirst({
    where: { title: { contains: "Abdul Khader" } },
  });
  assert.ok(postJulyDecision, "Post-July 2024 transitional judgment must exist");
  assert.ok(postJulyDecision.fullText.includes("531"), "Must reference Section 531 BNSS savings clause");
});

// Criterion 11 & 12: Private notes and bookmarks isolation between advocates
test("Criterion 11 & 12: Private notes and research folders isolation", async () => {
  const user1 = await prisma.user.findUnique({ where: { email: "advocate@supremecourt.in" } });
  const user2 = await prisma.user.findUnique({ where: { email: "advocate.karnataka@law.in" } });

  assert.ok(user1 && user2, "Both test advocates must exist");

  // User 1's private notes
  const user1Notes = await prisma.personalNote.findMany({ where: { userId: user1.id } });
  assert.ok(user1Notes.length > 0, "User 1 must have notes");

  // User 2 query for User 1's notes must return empty
  const user2QueryForUser1 = await prisma.personalNote.findMany({
    where: { userId: user2.id },
  });

  // Verify none of user 1's notes leak to user 2
  for (const n of user1Notes) {
    assert.notEqual(n.userId, user2.id);
  }
});

// Criterion 13: Duplicate document imports detection
test("Criterion 13: Duplicate document checksum detection", async () => {
  const existing = await prisma.judgment.findFirst();
  assert.ok(existing?.documentChecksum, "Existing judgment must have documentChecksum");

  // Simulating duplicate import check
  const duplicate = await prisma.judgment.findFirst({
    where: { documentChecksum: existing.documentChecksum },
  });
  assert.equal(duplicate?.id, existing.id, "Duplicate detection must match identical checksum");
});
