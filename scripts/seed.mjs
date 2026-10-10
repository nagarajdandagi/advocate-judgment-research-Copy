import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Advocate Legal Judgment Research System Database Seed...");

  // 1. Clear existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.personalNote.deleteMany();
  await prisma.researchFolderJudgment.deleteMany();
  await prisma.researchFolder.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.judgmentRelationship.deleteMany();
  await prisma.citation.deleteMany();
  await prisma.judgmentSection.deleteMany();
  await prisma.actSection.deleteMany();
  await prisma.act.deleteMany();
  await prisma.judgmentDocument.deleteMany();
  await prisma.judgment.deleteMany();
  await prisma.sourceConnector.deleteMany();
  await prisma.court.deleteMany();
  await prisma.user.deleteMany();
  await prisma.ingestionJob.deleteMany();

  console.log("Cleaned existing database records.");

  // 2. Create Courts
  const sci = await prisma.court.create({
    data: {
      code: "SCI",
      name: "Supreme Court of India",
      jurisdiction: "All India (Apex Court)",
      state: null,
      hierarchyLevel: 1,
      benches: JSON.stringify(["Principal Bench, Tilak Marg, New Delhi"]),
      websiteUrl: "https://main.sci.gov.in",
      active: true,
    },
  });

  const hckar = await prisma.court.create({
    data: {
      code: "HCKAR",
      name: "High Court of Karnataka",
      jurisdiction: "State of Karnataka",
      state: "Karnataka",
      hierarchyLevel: 2,
      benches: JSON.stringify([
        "Principal Bench, Bengaluru",
        "Dharwad Bench",
        "Kalaburagi Bench",
      ]),
      websiteUrl: "https://karnatakahihecourt.kar.nic.in",
      active: true,
    },
  });

  console.log("Created Courts: Supreme Court of India & High Court of Karnataka");

  // 3. Create Source Connectors
  await prisma.sourceConnector.createMany({
    data: [
      {
        courtId: sci.id,
        connectorName: "Supreme Court Official Judgment Portal",
        sourceUrl: "https://main.sci.gov.in/judgments",
        authType: "PUBLIC_PORTAL",
        status: "ONLINE",
        rateLimitNotes: "30 requests/min, robots.txt compliant",
        robotsVerified: true,
        active: true,
      },
      {
        courtId: hckar.id,
        connectorName: "High Court of Karnataka Case Information System",
        sourceUrl: "https://karnatakahihecourt.kar.nic.in/caseinformation",
        authType: "PUBLIC_PORTAL",
        status: "ONLINE",
        rateLimitNotes: "20 requests/min, daily sync enabled",
        robotsVerified: true,
        active: true,
      },
      {
        courtId: hckar.id,
        connectorName: "eCourts Services Karnataka Portal",
        sourceUrl: "https://services.ecourts.gov.in/ecourtindia_v6/",
        authType: "PUBLIC_API",
        status: "ONLINE",
        rateLimitNotes: "Direct eCourts API integration",
        robotsVerified: true,
        active: true,
      },
    ],
  });

  // 4. Create Users
  const passwordHash = await bcrypt.hash("Advocate@2026", 10);
  const adminPasswordHash = await bcrypt.hash("Admin@2026", 10);

  const advocateUser = await prisma.user.create({
    data: {
      email: "advocate@supremecourt.in",
      passwordHash,
      name: "Advocate Siddharudha Tegur",
      barRegistrationNo: "KAR/1428/2008",
      courtPractice: "Supreme Court of India & High Court of Karnataka",
      role: "ADVOCATE",
    },
  });

  const advocateKarUser = await prisma.user.create({
    data: {
      email: "advocate.karnataka@law.in",
      passwordHash,
      name: "Advocate Priyamvada Rao",
      barRegistrationNo: "KAR/2891/2014",
      courtPractice: "High Court of Karnataka (Bengaluru & Dharwad)",
      role: "ADVOCATE",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@court.in",
      passwordHash: adminPasswordHash,
      name: "Legal Library Administrator",
      barRegistrationNo: "DL/REG/009",
      courtPractice: "Judicial Research & Ingestion Bureau",
      role: "ADMIN",
    },
  });

  console.log("Created Default Users (Advocate Siddharudha Tegur, Priyamvada Rao, Admin)");

  // 5. Create Acts & Act Sections
  // Criminal Law & Legislation
  const ipc = await prisma.act.create({
    data: {
      shortName: "IPC",
      officialName: "Indian Penal Code, 1860",
      year: 1860,
      category: "Criminal Law",
      isHistorical: true,
      repealedOn: new Date("2024-07-01"),
      transitionalNote:
        "Repealed by Bharatiya Nyaya Sanhita, 2023 w.e.f. 01-07-2024. Applicable to offences committed prior to 01-07-2024 as per Section 358 BNS and General Clauses Act Section 6.",
    },
  });

  const bns = await prisma.act.create({
    data: {
      shortName: "BNS",
      officialName: "Bharatiya Nyaya Sanhita, 2023",
      year: 2023,
      category: "Criminal Law",
      isHistorical: false,
      effectiveDate: new Date("2024-07-01"),
      transitionalNote:
        "In force from 01-07-2024. Governs substantive criminal offences committed on or after 01-07-2024. Prior offences remain governed by IPC, 1860.",
    },
  });

  const crpc = await prisma.act.create({
    data: {
      shortName: "CrPC",
      officialName: "Code of Criminal Procedure, 1973",
      year: 1973,
      category: "Criminal Law",
      isHistorical: true,
      repealedOn: new Date("2024-07-01"),
      transitionalNote:
        "Repealed by BNSS, 2023 w.e.f. 01-07-2024. Under Section 531(2)(a) BNSS, any appeal, application, trial, inquiry or investigation pending immediately before 01-07-2024 continues under CrPC, 1973.",
    },
  });

  const bnss = await prisma.act.create({
    data: {
      shortName: "BNSS",
      officialName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
      year: 2023,
      category: "Criminal Law",
      isHistorical: false,
      effectiveDate: new Date("2024-07-01"),
      transitionalNote:
        "In force from 01-07-2024. Procedure for inquiries and trials instituted on or after 01-07-2024. Subject to savings clause in Section 531 BNSS.",
    },
  });

  const iea = await prisma.act.create({
    data: {
      shortName: "IEA",
      officialName: "Indian Evidence Act, 1872",
      year: 1872,
      category: "Criminal Law",
      isHistorical: true,
      repealedOn: new Date("2024-07-01"),
      transitionalNote:
        "Repealed by Bharatiya Sakshya Adhiniyam, 2023 w.e.f. 01-07-2024. Proceedings initiated prior to 01-07-2024 proceed subject to BSA Section 170 savings.",
    },
  });

  const bsa = await prisma.act.create({
    data: {
      shortName: "BSA",
      officialName: "Bharatiya Sakshya Adhiniyam, 2023",
      year: 2023,
      category: "Criminal Law",
      isHistorical: false,
      effectiveDate: new Date("2024-07-01"),
      transitionalNote:
        "In force from 01-07-2024. Regulates admissibility, electronic records (Section 63), and confessions.",
    },
  });

  const niAct = await prisma.act.create({
    data: {
      shortName: "NI Act",
      officialName: "Negotiable Instruments Act, 1881",
      year: 1881,
      category: "Commercial Law",
      isHistorical: false,
      transitionalNote:
        "Special penal and civil statute governing promissory notes, bills of exchange, and cheque dishonour under Chapter XVII.",
    },
  });

  const constitution = await prisma.act.create({
    data: {
      shortName: "Constitution",
      officialName: "Constitution of India, 1950",
      year: 1950,
      category: "Constitutional Law",
      isHistorical: false,
      transitionalNote: "Supreme lex of the Republic of India.",
    },
  });

  const cpc = await prisma.act.create({
    data: {
      shortName: "CPC",
      officialName: "Code of Civil Procedure, 1908",
      year: 1908,
      category: "Civil Law",
      isHistorical: false,
      transitionalNote: "Governs civil court jurisdiction, appeals, revisions, and execution proceedings.",
    },
  });

  const pcAct = await prisma.act.create({
    data: {
      shortName: "PC Act",
      officialName: "Prevention of Corruption Act, 1988",
      year: 1988,
      category: "Criminal Law",
      isHistorical: false,
      transitionalNote: "Special statute for offences by public servants; amended comprehensively in 2018.",
    },
  });

  const dvAct = await prisma.act.create({
    data: {
      shortName: "DV Act",
      officialName: "Protection of Women from Domestic Violence Act, 2005",
      year: 2005,
      category: "Family & Civil Law",
      isHistorical: false,
      transitionalNote: "Quasi-criminal and civil protective remedies for aggrieved women.",
    },
  });

  // Populate Key Sections with Transitional Mappings
  const sec420Ipc = await prisma.actSection.create({
    data: {
      actId: ipc.id,
      chapterNumber: "Chapter XVII",
      chapterTitle: "Of Offences Against Property",
      sectionNumber: "420",
      sectionTitle: "Cheating and dishonestly inducing delivery of property",
      contentSummary:
        "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment up to seven years, and shall also be liable to fine.",
      correspondingActName: "Bharatiya Nyaya Sanhita, 2023",
      correspondingSection: "Section 318(4)",
      equivalenceType: "VERIFIED",
      transitionalGuidance:
        "For acts alleged prior to 01-07-2024, charge must be framed under IPC Section 420. For acts occurring on or after 01-07-2024, Section 318(4) BNS applies. Elements of dishonest intention at inception remain substantively similar.",
    },
  });

  const sec318Bns = await prisma.actSection.create({
    data: {
      actId: bns.id,
      chapterNumber: "Chapter XVII",
      chapterTitle: "Of Offences Against Property",
      sectionNumber: "318(4)",
      sectionTitle: "Cheating and dishonestly inducing delivery of property",
      contentSummary:
        "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
      correspondingActName: "Indian Penal Code, 1860",
      correspondingSection: "Section 420",
      equivalenceType: "VERIFIED",
      transitionalGuidance:
        "Corresponds to Section 420 IPC. Applies to offences committed on or after 01-07-2024.",
    },
  });

  const sec438Crpc = await prisma.actSection.create({
    data: {
      actId: crpc.id,
      chapterNumber: "Chapter XXXIII",
      chapterTitle: "Provisions as to Bail and Bonds",
      sectionNumber: "438",
      sectionTitle: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
      contentSummary:
        "Where any person has reason to believe that he may be arrested on an accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section.",
      correspondingActName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
      correspondingSection: "Section 482",
      equivalenceType: "VERIFIED",
      transitionalGuidance:
        "Where FIR is registered or complaint is filed prior to 01-07-2024, bail applications may be instituted under Section 438 CrPC or Section 482 BNSS. High Courts (including Karnataka HC) have clarified that numbering under CrPC or BNSS is not fatal, but procedural rights are preserved.",
    },
  });

  const sec439Crpc = await prisma.actSection.create({
    data: {
      actId: crpc.id,
      chapterNumber: "Chapter XXXIII",
      chapterTitle: "Provisions as to Bail and Bonds",
      sectionNumber: "439",
      sectionTitle: "Special powers of High Court or Court of Session regarding bail (Regular Bail)",
      contentSummary:
        "A High Court or Court of Session may direct that any person accused of an offence and in custody be released on bail.",
      correspondingActName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
      correspondingSection: "Section 483",
      equivalenceType: "VERIFIED",
      transitionalGuidance: "Corresponds to Section 483 BNSS, 2023.",
    },
  });

  const sec482Crpc = await prisma.actSection.create({
    data: {
      actId: crpc.id,
      chapterNumber: "Chapter XXXVII",
      chapterTitle: "Miscellaneous",
      sectionNumber: "482",
      sectionTitle: "Saving of inherent powers of High Court",
      contentSummary:
        "Nothing in this Code shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Code, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.",
      correspondingActName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
      correspondingSection: "Section 528",
      equivalenceType: "VERIFIED",
      transitionalGuidance:
        "Karnataka High Court held in Abdul Khader vs State (July 2024) that quashing petitions filed post 01-07-2024 can be captioned under Section 528 BNSS or Section 482 CrPC without prejudice.",
    },
  });

  const sec482Bnss = await prisma.actSection.create({
    data: {
      actId: bnss.id,
      chapterNumber: "Chapter XXXV",
      chapterTitle: "Provisions as to Bail and Bonds",
      sectionNumber: "482",
      sectionTitle: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
      contentSummary:
        "Anticipatory bail powers of High Court or Court of Session under the new Sanhita.",
      correspondingActName: "Code of Criminal Procedure, 1973",
      correspondingSection: "Section 438",
      equivalenceType: "VERIFIED",
      transitionalGuidance: "Replaces Section 438 CrPC w.e.f. 01-07-2024.",
    },
  });

  const sec528Bnss = await prisma.actSection.create({
    data: {
      actId: bnss.id,
      chapterNumber: "Chapter XXXIX",
      chapterTitle: "Miscellaneous",
      sectionNumber: "528",
      sectionTitle: "Saving of inherent powers of High Court",
      contentSummary:
        "Inherent jurisdiction of High Court to prevent abuse of court process or secure ends of justice under BNSS, 2023.",
      correspondingActName: "Code of Criminal Procedure, 1973",
      correspondingSection: "Section 482",
      equivalenceType: "VERIFIED",
      transitionalGuidance: "Replaces Section 482 CrPC.",
    },
  });

  const sec41ACrpc = await prisma.actSection.create({
    data: {
      actId: crpc.id,
      chapterNumber: "Chapter V",
      chapterTitle: "Arrest of Persons",
      sectionNumber: "41A",
      sectionTitle: "Notice of appearance before police officer",
      contentSummary:
        "Mandatory issuance of notice of appearance in offences punishable with imprisonment up to seven years prior to making any arrest.",
      correspondingActName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
      correspondingSection: "Section 35(3)",
      equivalenceType: "VERIFIED",
      transitionalGuidance:
        "Incorporated in Section 35(3) BNSS with requirement of prior permission from officer not below DSP rank for certain categories.",
    },
  });

  const sec498AIpc = await prisma.actSection.create({
    data: {
      actId: ipc.id,
      chapterNumber: "Chapter XXA",
      chapterTitle: "Of Cruelty by Husband or Relatives of Husband",
      sectionNumber: "498A",
      sectionTitle: "Husband or relative of husband of a woman subjecting her to cruelty",
      contentSummary:
        "Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment up to three years and fine.",
      correspondingActName: "Bharatiya Nyaya Sanhita, 2023",
      correspondingSection: "Section 85 / 86",
      equivalenceType: "APPROXIMATE",
      transitionalGuidance:
        "BNS separates matrimonial cruelty into Section 85 (punishment for cruelty) and Section 86 (definition of cruelty). Carefully verify date of occurrence.",
    },
  });

  const sec138Ni = await prisma.actSection.create({
    data: {
      actId: niAct.id,
      chapterNumber: "Chapter XVII",
      chapterTitle: "Of Penalties in Case of Dishonour of Certain Cheques",
      sectionNumber: "138",
      sectionTitle: "Dishonour of cheque for insufficiency, etc., of funds in the account",
      contentSummary:
        "Deemed criminal offence where a cheque drawn by a person is returned unpaid by the bank for insufficiency of funds or exceeding agreement amount, subject to statutory statutory notice of 15 days.",
      correspondingActName: "Not Affected by 2023 Sanhitas",
      correspondingSection: "Section 138 (Continuing Act)",
      equivalenceType: "VERIFIED",
      transitionalGuidance:
        "Special Act unaffected by IPC/BNS repeal. Cognizance and trial procedure governed by BNSS/CrPC pursuant to Section 4/5.",
    },
  });

  const art21Const = await prisma.actSection.create({
    data: {
      actId: constitution.id,
      chapterNumber: "Part III",
      chapterTitle: "Fundamental Rights",
      sectionNumber: "Article 21",
      sectionTitle: "Protection of life and personal liberty",
      contentSummary:
        "No person shall be deprived of his life or personal liberty except according to procedure established by law.",
      correspondingActName: "Fundamental Law",
      correspondingSection: "Article 21",
      equivalenceType: "VERIFIED",
      transitionalGuidance: "Paramount constitutional touchstone in all bail, arrest, and personal liberty adjudications.",
    },
  });

  const sec13PcAct = await prisma.actSection.create({
    data: {
      actId: pcAct.id,
      chapterNumber: "Chapter III",
      chapterTitle: "Offences and Penalties",
      sectionNumber: "13",
      sectionTitle: "Criminal misconduct by a public servant",
      contentSummary:
        "Punishment for intentional illicit enrichment or conversion of property by a public servant.",
      correspondingActName: "Prevention of Corruption Act",
      correspondingSection: "Section 13 (as amended in 2018)",
      equivalenceType: "VERIFIED",
      transitionalGuidance: "Pre-2018 vs Post-2018 amendment statutory distinction applies based on offence date.",
    },
  });

  console.log("Created Acts and Key Act Sections with transitional equivalences.");

  // 6. Create Verified Judgments
  // Judgment 1: Arnesh Kumar vs State of Bihar & Anr (Supreme Court)
  const jArnesh = await prisma.judgment.create({
    data: {
      courtId: sci.id,
      benchName: "Principal Bench, New Delhi",
      benchType: "Division Bench",
      title: "Arnesh Kumar vs State of Bihar & Anr",
      petitioner: "Arnesh Kumar",
      respondent: "State of Bihar & Anr",
      caseType: "Criminal Appeal",
      caseNumber: "Criminal Appeal No. 1277 of 2014",
      caseYear: 2014,
      judgmentDate: new Date("2014-07-02"),
      disposalNature: "Allowed with mandatory nationwide directions",
      authorJudge: "Chandramauli Kr. Prasad, J.",
      coram: "Chandramauli Kr. Prasad and Pinaki Chandra Ghose, JJ.",
      neutralCitation: "2014 INSC 493",
      reportedCitation: "(2014) 8 SCC 273; AIR 2014 SC 2756; 2014 Cr LJ 3707",
      legalTopics: JSON.stringify(["Arrest Guidelines", "Section 41A CrPC", "Bail", "Section 498A IPC", "Abuse of Police Power"]),
      folderCategories: JSON.stringify(["Criminal Matters", "Bail and Anticipatory Bail", "Special Leave Petitions"]),
      headnote:
        "Code of Criminal Procedure, 1973 — Sections 41, 41A and 438 — Penal Code, 1860 — Section 498A — Dowry Prohibition Act, 1961 — Section 4 — Arrest of accused in offences punishable with imprisonment up to 7 years — Police officers shall not arrest the accused unnecessarily and Magistrate shall not authorize detention casually and mechanically — Mandatory 8-point directions issued.",
      fullText: `[1] The petitioner has preferred this appeal by grant of special leave against the judgment and order dated 17th April, 2014 passed by the High Court of Judicature at Patna in Criminal Miscellaneous No. 30041 of 2013, rejecting his prayer for anticipatory bail under Section 438 of the Code of Criminal Procedure, 1973.

[2] The petitioner is the husband of respondent No. 2. A complaint was lodged against him alleging demand of dowry including Rs. 8 lakhs, a Maruti car, air conditioner, and cruelty in connection with marriage. On the basis of the said complaint, an FIR was registered under Section 498A of the Indian Penal Code, 1860 and Section 4 of the Dowry Prohibition Act, 1961. Apprehending arrest, petitioner applied for anticipatory bail which was rejected by the learned Sessions Judge and affirmed by the High Court.

[3] Arrest brings humiliation, curtails freedom and casts scars forever. Law makers know it so also the police. There is a battle between the lawmakers and the police and it seems that police has not learnt its lesson. The need for caution in exercising the power of arrest has been repeatedly emphasized by this Court. Our experience shows that the arrest is made not because of the necessity of the case, but as a punitive tool.

[4] Section 41 of the Code of Criminal Procedure provides that any police officer may without an order from a Magistrate and without a warrant, arrest any person who has been concerned in any cognizable offence. By the Code of Criminal Procedure (Amendment) Act, 2008, Parliament introduced significant amendments in Section 41 and inserted Section 41A with the objective to prevent unnecessary arrests.

[5] Section 41(1)(b) of the Code lays down that for offences punishable with imprisonment for a term which may be less than seven years or which may extend to seven years, arrest can be made only if the police officer has reason to believe on the basis of information that such person has committed the said offence, and the police officer is satisfied that such arrest is necessary for one or more specified reasons: to prevent such person from committing any further offence, for proper investigation of the offence, to prevent such person from causing the evidence to disappear, or to prevent such person from making any inducement, threat or promise.

[6] In all cases where the arrest of a person is not required under the provisions of sub-section (1) of Section 41, the police officer is required under Section 41A to issue a notice directing the person against whom a reasonable complaint has been made, to appear before him at such place and time as may be specified in the notice.

[7] In order to ensure that police officers do not arrest accused unnecessarily and Magistrate do not authorize detention casually and mechanically, we issue the following mandatory directions:
(1) All the State Governments to instruct its police officers not to automatically arrest when a case under Section 498-A of the IPC is registered but to satisfy themselves about the necessity for arrest under the parameters laid down above flowing from Section 41, Cr.PC;
(2) All police officers be provided with a check list containing specified sub-clauses under Section 41(1)(b)(ii);
(3) The police officer shall forward the check list duly filed and furnish the reasons and materials which necessitated the arrest, while forwarding/producing the accused before the Magistrate for further detention;
(4) The Magistrate while authorizing detention of the accused shall peruse the report furnished by the police officer in terms aforesaid and only after recording its satisfaction, the Magistrate shall authorize detention;
(5) The decision not to arrest an accused, be forwarded to the Magistrate within two weeks from the date of the institution of the case with a copy to the Magistrate which may be extended by the Superintendent of Police of the district for the reasons to be recorded in writing;
(6) Notice of appearance in terms of Section 41A of Cr.PC be served on the accused within two weeks from the date of institution of the case, which may be extended by the Superintendent of Police of the District for the reasons to be recorded in writing;
(7) Failure to comply with the directions aforesaid shall apart from rendering the police officers concerned liable for departmental action, they shall also be liable to be punished for contempt of court to be instituted before High Court having territorial jurisdiction;
(8) Authorising detention without recording reasons as aforesaid by the judicial Magistrate concerned shall be liable for departmental action by the appropriate High Court.

[8] We hasten to add that the directions aforesaid shall not only apply to the cases under Section 498-A of the I.P.C. or Section 4 of the Dowry Prohibition Act, but also to such cases where offence is punishable with imprisonment for a term which may be less than seven years or which may extend to seven years; whether with or without fine.

[9] In the result, the appeal is allowed. The order of the High Court is set aside. Petitioner is directed to be released on anticipatory bail in the event of his arrest on furnishing bail bond of Rs. 10,000/- with two sureties of the like amount to the satisfaction of the arresting officer.`,
      paragraphCount: 9,
      sourceUrl: "https://main.sci.gov.in/supremecourt/2014/1277/1277_2014_Judgement_02-Jul-2014.pdf",
      verificationStatus: "VERIFIED",
      documentChecksum: crypto.createHash("sha256").update("arnesh_kumar_2014_verified_judgment_text").digest("hex"),
      isOverruled: false,
      precedentialStatus: "BINDING_PRECEDENT",
      practicalNotes:
        "Primary authority cited before trial courts and High Courts to resist remand or seek bail where arrest was made without compliance with Section 41A notice. Non-compliance gives immediate ground for bail.",
      briefFacts:
        "Petitioner-husband was accused under Section 498A IPC and Section 4 Dowry Prohibition Act on allegations of dowry demand and cruelty. His anticipatory bail was dismissed by the Sessions Court and Patna High Court.",
      briefIssues: JSON.stringify([
        "Whether automatic arrest in offences punishable up to seven years without recording necessity under Section 41(1)(b) CrPC is permissible.",
        "What safeguards must be mandated to prevent routine and mechanical arrests by police and automatic remands by Magistrates.",
      ]),
      briefArguments:
        "Appellant argued that arrest was sought as a tool of harassment without genuine necessity for custodial interrogation. State argued that offences under Section 498A were cognizable and police had statutory power to arrest.",
      briefQuestions: JSON.stringify([
        "Scope of Section 41 and Section 41A CrPC in limiting arbitrary arrest.",
        "Magisterial duty under Section 167 CrPC to verify grounds of arrest before authorising detention.",
      ]),
      briefReasoning:
        "The Supreme Court held that power of arrest is distinct from justification for arrest. Section 41(1)(b) circumscribes the police discretion, requiring documented satisfaction of necessity. Mechanical remand by judicial magistrates without scrutinising the police checklist violates constitutional due process under Article 21.",
      briefOutcome:
        "Appeal allowed. Anticipatory bail granted to the petitioner on bail bond of Rs. 10,000/-. Eight binding nationwide directions issued covering all offences punishable with imprisonment up to seven years.",
      briefRatioDecidendi: JSON.stringify([
        "Arrest in offences punishable up to 7 years imprisonment cannot be made automatically or mechanically.",
        "Police must furnish a duly filled checklist under Section 41(1)(b)(ii) CrPC before the Magistrate.",
        "Magistrate must apply judicial mind to the checklist before authorizing remand under Section 167 CrPC.",
        "Notice under Section 41A CrPC must be served within two weeks of case institution.",
      ]),
      briefObiterDicta:
        "Observations regarding the misuse of Section 498A IPC by disgruntled persons as a weapon rather than a shield.",
      briefEarlierCases: JSON.stringify([
        "Joginder Kumar vs State of UP (1994) 4 SCC 260",
        "D.K. Basu vs State of West Bengal (1997) 1 SCC 416",
      ]),
      briefFollowedOverruled: JSON.stringify([
        "Followed and expanded: Satender Kumar Antil vs CBI (2022) 10 SCC 51",
        "Applied across all High Courts including High Court of Karnataka",
      ]),
      briefAdvocateRelevance:
        "Indispensable in daily criminal practice. Must be quoted in every remand hearing, bail petition, and anticipatory bail application for offences punishable up to 7 years imprisonment (including Section 420 IPC / Section 318(4) BNS).",
      briefImportantParas: JSON.stringify(["[¶ 5]", "[¶ 7]", "[¶ 8]"]),
      briefLimitations:
        "Directions specifically cover offences punishable up to seven years imprisonment. Severe offences exceeding seven years fall under distinct judicial guidelines.",
      isAiGenerated: false,
    },
  });

  // Judgment 2: Satender Kumar Antil vs CBI (Supreme Court)
  const jAntil = await prisma.judgment.create({
    data: {
      courtId: sci.id,
      benchName: "Principal Bench, New Delhi",
      benchType: "Division Bench",
      title: "Satender Kumar Antil vs Central Bureau of Investigation & Anr",
      petitioner: "Satender Kumar Antil",
      respondent: "Central Bureau of Investigation & Anr",
      caseType: "Special Leave Petition (Crl.)",
      caseNumber: "Miscellaneous Application No. 1849 of 2021 in SLP (Crl.) No. 5191 of 2021",
      caseYear: 2022,
      judgmentDate: new Date("2022-07-11"),
      disposalNature: "Disposed of with comprehensive guidelines",
      authorJudge: "M.M. Sundresh, J.",
      coram: "Sanjay Kishan Kaul and M.M. Sundresh, JJ.",
      neutralCitation: "2022 INSC 690",
      reportedCitation: "(2022) 10 SCC 51; 2022 LiveLaw (SC) 577",
      legalTopics: JSON.stringify(["Bail Guidelines", "Categorization of Offences", "Section 420 IPC", "Section 436A CrPC", "Section 88 CrPC"]),
      folderCategories: JSON.stringify(["Criminal Matters", "Bail and Anticipatory Bail", "Special Leave Petitions"]),
      headnote:
        "Code of Criminal Procedure, 1973 — Sections 41, 41A, 88, 170, 204, 209, 436A, 437, 438 and 439 — Comprehensive guidelines framed for grant of bail without taking accused into custody upon appearance pursuant to summons/warrant — Four categories of offences defined: Category A (punishable up to 7 years), Category B (grave offences/life), Category C (Special Acts), Category D (economic offences).",
      fullText: `[1] The journey of personal liberty is unending. It is the bounden duty of the court to uphold the majesty of Article 21. Jails in India are flooded with undertrial prisoners who cannot secure release due to structural delay and stringent bail interpretation.

[2] By our earlier order dated 07.10.2021, we issued guidelines for consideration of bail applications where the accused was not arrested during investigation and cooperated with the investigating agency. We now pronounce a comprehensive judgment covering statutory compliance across investigating agencies and subordinate courts.

[3] CATEGORY A: Offences punishable with imprisonment of 7 years or less not falling in Category B and D:
(a) Ordinary summons for appearance be issued in the first instance;
(b) If accused does not appear despite service, bailable warrant;
(c) Non-bailable warrant only on persistent failure;
(d) On appearance in court pursuant to summons or warrant, bail application be decided without taking the accused into physical custody.

[4] CATEGORY B: Offences punishable with death, imprisonment for life, or imprisonment for more than 7 years:
Bail application to be decided on merits on appearance or production of the accused.

[5] CATEGORY C: Offences punishable under Special Acts containing stringent reverse-burden bail conditions (e.g., NDPS, PMLA, TADA, UAPA, Companies Act):
Bail application to be decided on merits considering the compliance of the specific statutory negative covenants.

[6] CATEGORY D: Economic Offences not covered by Special Acts (including Section 420 IPC, Section 406 IPC, Section 409 IPC, Section 468 IPC):
Bail application to be decided on merits, but the seriousness of the economic offence to be weighed against individual overt acts and evidence collected. Not all economic offences can be treated with a uniform brush.

[7] Section 41A Cr.P.C. compliance is mandatory. Any non-compliance shall entitle the accused to grant of bail. Investigating agencies and police officers are bound by the law laid down in Arnesh Kumar vs State of Bihar. High Courts are requested to ensure subordinate courts adhere strictly to these principles.`,
      paragraphCount: 7,
      sourceUrl: "https://main.sci.gov.in/supremecourt/2021/1849/1849_2021_Judgement_11-Jul-2022.pdf",
      verificationStatus: "VERIFIED",
      documentChecksum: crypto.createHash("sha256").update("satender_kumar_antil_2022_verified_judgment").digest("hex"),
      isOverruled: false,
      precedentialStatus: "BINDING_PRECEDENT",
      practicalNotes:
        "The standard benchmark for criminal court practice. Category A covers Section 420 IPC (cheating). Advocates should invoke Category A directly upon chargesheet summons to prevent judicial remand.",
      briefFacts:
        "The Supreme Court took suo motu and appellate note of widespread overcrowding in Indian prisons due to routine arrest and unnecessary detention of accused who had cooperated throughout the investigation.",
      briefIssues: JSON.stringify([
        "Whether an accused who was never arrested during investigation must be remanded to custody upon appearance before Magistrate pursuant to chargesheet summons under Section 170 CrPC.",
        "Categorization of offences for streamlined bail adjudication.",
      ]),
      briefArguments:
        "Amicus Curiae highlighted that magistrates routinely send cooperating accused to jail simply because chargesheet was filed. CBI and State counsels submitted guidelines should preserve investigative efficacy in economic offences.",
      briefQuestions: JSON.stringify([
        "Interaction between Section 170 CrPC, Section 88 CrPC, and Bail provisions.",
        "Enforceability of Section 41A CrPC at the stage of taking cognizance.",
      ]),
      briefReasoning:
        "The Court reiterated that 'Bail is the rule, jail is the exception' (State of Rajasthan vs Balchand). Under Section 170 CrPC, the officer forwarding an accused does not necessarily mean physical custody if the accused has not been arrested and has cooperated. Mechanical remands violate personal liberty under Article 21.",
      briefOutcome:
        "Directions issued classifying offences into four clear categories (A, B, C, D) with mandatory timelines for bail hearings. Subordinate courts cautioned against remanding cooperating accused upon appearance.",
      briefRatioDecidendi: JSON.stringify([
        "For Category A offences (punishable up to 7 years including IPC 420), bail application must be considered without taking the accused into physical custody if summons was complied with.",
        "Compliance with Section 41 and 41A CrPC is a condition precedent to detention.",
        "Section 170 CrPC does not mandate physical arrest of accused by investigating agency before filing chargesheet.",
      ]),
      briefObiterDicta:
        "Desirability of the Union Government introducing a standalone Bail Act similar to the United Kingdom Bail Act.",
      briefEarlierCases: JSON.stringify([
        "Arnesh Kumar vs State of Bihar (2014) 8 SCC 273",
        "Siddharam Satlingappa Mhetre vs State of Maharashtra (2011) 1 SCC 694",
        "Siddharth vs State of U.P. (2022) 1 SCC 676",
      ]),
      briefFollowedOverruled: JSON.stringify([
        "Reiterated: Siddharth vs State of UP",
        "Followed nationwide by all High Courts and Sessions Courts",
      ]),
      briefAdvocateRelevance:
        "Vital in daily practice whenever a client receives summons after chargesheet is filed under Section 420 IPC, Section 406 IPC, or Section 498A IPC. Prevents client from being sent to judicial custody on first appearance.",
      briefImportantParas: JSON.stringify(["[¶ 3]", "[¶ 6]", "[¶ 7]"]),
      briefLimitations:
        "Category C offences involving special reverse-burden clauses (e.g. NDPS Section 37, PMLA Section 45) require satisfaction of the statutory twin conditions.",
      isAiGenerated: false,
    },
  });

  // Judgment 3: Gurbaksh Singh Sibbia vs State of Punjab (Supreme Court Constitution Bench)
  const jSibbia = await prisma.judgment.create({
    data: {
      courtId: sci.id,
      benchName: "Principal Bench, New Delhi",
      benchType: "Constitution Bench",
      title: "Gurbaksh Singh Sibbia & Ors vs State of Punjab",
      petitioner: "Gurbaksh Singh Sibbia & Ors",
      respondent: "State of Punjab",
      caseType: "Criminal Appeal",
      caseNumber: "Criminal Appeal No. 335 of 1978",
      caseYear: 1980,
      judgmentDate: new Date("1980-04-09"),
      disposalNature: "Allowed in part with landmark principles",
      authorJudge: "Y.V. Chandrachud, C.J.",
      coram: "Y.V. Chandrachud, C.J., P.N. Bhagwati, V.R. Krishna Iyer, R.S. Sarkaria and A.D. Koshal, JJ.",
      neutralCitation: "1980 INSC 67",
      reportedCitation: "(1980) 2 SCC 565; AIR 1980 SC 1632; 1980 SCC (Cri) 465",
      legalTopics: JSON.stringify(["Anticipatory Bail", "Section 438 CrPC", "Article 21", "Judicial Discretion", "Pre-Arrest Bail"]),
      folderCategories: JSON.stringify(["Criminal Matters", "Constitutional Matters", "Bail and Anticipatory Bail"]),
      headnote:
        "Code of Criminal Procedure, 1973 — Section 438 — Constitution of India, 1950 — Article 21 — Anticipatory Bail — Scope, amplitude and parameters — High Court cannot read narrow, artificial restrictions into Section 438 not placed by Parliament — Section 438 confers wide judicial discretion to protect innocent persons from harassment and humiliation — Registration of FIR not a prerequisite.",
      fullText: `[1] The question which arises for consideration in these appeals is whether the power to grant anticipatory bail under Section 438 of the Code of Criminal Procedure, 1973 is subject to the restrictive limitations laid down by the Full Bench of the Punjab and Haryana High Court.

[2] Section 438 of the Code was introduced for the first time by Parliament following the recommendations of the 41st Law Commission Report. The Law Commission observed that the necessity for granting anticipatory bail arises mainly because sometimes influential persons try to implicate their rivals in false cases for the purpose of disgracing them or for other purposes by getting them detained in jail.

[3] The High Court laid down eight propositions restricting the scope of Section 438, holding that the power must be exercised only in exceptional cases and cannot be invoked unless an FIR is actually registered or specific allegations exist.

[4] We are unable to agree with the narrow view taken by the High Court. The power conferred by Section 438 is wide and untrammelled by artificial fetters. It is rooted in Article 21 of the Constitution of India. The legislature did not choose to define the exact circumstances in which anticipatory bail should be granted because the variety of human conduct cannot be catalogued in advance.

[5] A person seeking anticipatory bail must demonstrate a reasonable belief that he may be arrested on an accusation of a non-bailable offence. The filing of an FIR is not a condition precedent to the exercise of power under Section 438. An apprehension of arrest founded on reasonable grounds is sufficient.

[6] At the same time, anticipatory bail cannot be granted as a blanket order. The order must be circumscribed by appropriate conditions under Section 438(2), ensuring that the applicant joins investigation and does not tamper with evidence or flee justice.`,
      paragraphCount: 6,
      sourceUrl: "https://main.sci.gov.in/supremecourt/1978/335/335_1978_Judgement_09-Apr-1980.pdf",
      verificationStatus: "VERIFIED",
      documentChecksum: crypto.createHash("sha256").update("gurbaksh_singh_sibbia_1980_verified_judgment").digest("hex"),
      isOverruled: false,
      precedentialStatus: "BINDING_PRECEDENT",
      practicalNotes:
        "The foundational Magna Carta of anticipatory bail jurisprudence in India. Affirmed and explained by 5-Judge Bench in Sushila Aggarwal (2020). Reaffirmed for BNSS Section 482.",
      briefFacts:
        "The Minister of Irrigation and Power of Punjab and other political leaders apprehended arrest following a regime change in the state. They petitioned for anticipatory bail under Section 438 CrPC. The Full Bench of Punjab and Haryana High Court rejected the petitions holding Section 438 could only be invoked in rare and extraordinary cases.",
      briefIssues: JSON.stringify([
        "Whether Section 438 CrPC should be read restrictively as an extraordinary power.",
        "Whether registration of an FIR is a prerequisite for maintaining an anticipatory bail application.",
        "Whether blanket protective orders can be passed.",
      ]),
      briefArguments:
        "Appellants argued that Parliament deliberately placed no restriction on judicial discretion to safeguard personal liberty under Article 21. State argued that unfettered anticipatory bail would hamper police investigation.",
      briefQuestions: JSON.stringify([
        "Statutory interpretation of Section 438 in light of Article 21 of the Constitution.",
        "Parameters governing exercise of discretionary power by High Court and Sessions Court.",
      ]),
      briefReasoning:
        "The Constitution Bench held that judicial discretion must remain free from rigid judge-made fetters. Anticipatory bail is an essential device to protect citizens against unjustified arrests orchestrated by rivals or overzealous police. An FIR is not a mandatory condition precedent, but blanket immunity cannot be given.",
      briefOutcome:
        "Appeals allowed in part. The restrictive propositions laid down by the Full Bench of the High Court overruled. Broad, flexible guidelines laid down for exercise of powers under Section 438 CrPC.",
      briefRatioDecidendi: JSON.stringify([
        "Section 438 CrPC confers broad discretionary power without artificial restrictions.",
        "Registration of an FIR is not a condition precedent to moving an anticipatory bail petition.",
        "Anticipatory bail cannot be a blanket order; it must specify the accusation and be subject to statutory conditions.",
      ]),
      briefObiterDicta:
        "Discussion on the historical misuse of the power of arrest during political transitions in post-independence India.",
      briefEarlierCases: JSON.stringify([
        "Balchand vs State of Rajasthan AIR 1977 SC 2447",
      ]),
      briefFollowedOverruled: JSON.stringify([
        "Affirmed by 5-Judge Constitution Bench: Sushila Aggarwal vs State (NCT of Delhi) (2020) 5 SCC 1",
        "Overruled: Restrictive propositions in Full Bench decision of Punjab & Haryana HC",
      ]),
      briefAdvocateRelevance:
        "Every advocate drafting an anticipatory bail petition under Section 438 CrPC or Section 482 BNSS must anchor the plea in the Sibbia ratio, especially when moving the High Court before an FIR is numbered.",
      briefImportantParas: JSON.stringify(["[¶ 4]", "[¶ 5]", "[¶ 6]"]),
      briefLimitations:
        "Blanket orders shielding from any future unspecified offence are impermissible.",
      isAiGenerated: false,
    },
  });

  // Judgment 4: Dashrath Rupsingh Rathod vs State of Maharashtra (Supreme Court) - Section 138 NI Act
  const jDashrath = await prisma.judgment.create({
    data: {
      courtId: sci.id,
      benchName: "Principal Bench, New Delhi",
      benchType: "Full Bench",
      title: "Dashrath Rupsingh Rathod vs State of Maharashtra & Anr",
      petitioner: "Dashrath Rupsingh Rathod",
      respondent: "State of Maharashtra & Anr",
      caseType: "Criminal Appeal",
      caseNumber: "Criminal Appeal No. 2287 of 2009",
      caseYear: 2014,
      judgmentDate: new Date("2014-08-01"),
      disposalNature: "Allowed in part",
      authorJudge: "T.S. Thakur, J.",
      coram: "T.S. Thakur, Vikramajit Sen and C. Nagappan, JJ.",
      neutralCitation: "2014 INSC 555",
      reportedCitation: "(2014) 9 SCC 129; AIR 2014 SC 3519",
      legalTopics: JSON.stringify(["Section 138 NI Act", "Cheque Bounce", "Territorial Jurisdiction", "Section 177 CrPC", "Negotiable Instruments"]),
      folderCategories: JSON.stringify(["Criminal Matters", "Civil Matters", "Special Leave Petitions"]),
      headnote:
        "Negotiable Instruments Act, 1881 — Section 138 — Code of Criminal Procedure, 1973 — Sections 177 and 178 — Territorial jurisdiction to entertain cheque bounce complaint — Offence under Section 138 is committed at the place where the cheque is dishonoured by the drawee bank — Note: Parliament subsequently amended Section 142(2) NI Act in 2015 to redefine jurisdiction based on drawee bank branch.",
      fullText: `[1] The question of law in these appeals relates to the territorial jurisdiction of the Magistrate to try a complaint under Section 138 of the Negotiable Instruments Act, 1881.

[2] In K. Bhaskaran vs Sankaran Vaidhyan Balan (1999) 7 SCC 510, this Court held that an offence under Section 138 NI Act comprises five components, and the complaint could be filed at the place of any of the five components: (1) drawing of the cheque, (2) presentation, (3) return unpaid, (4) issuance of statutory notice, (5) failure to pay within 15 days.

[3] Our review of Section 138 read with Section 177 CrPC leads us to hold that the offence of dishonour of cheque occurs where the drawee bank dishonours the instrument. The place of issuance of legal notice or place of complainant's branch cannot confer artificial jurisdiction.

[4] Note on Precedential Status & Legislative Amendment: Subsequent to this judgment, Parliament intervened by enacting the Negotiable Instruments (Amendment) Act, 2015, inserting Section 142(2), which statutorily placed jurisdiction at the place where the branch of the bank where the payee maintains the account is situated if delivered for collection.`,
      paragraphCount: 4,
      sourceUrl: "https://main.sci.gov.in/supremecourt/2009/2287/2287_2009_Judgement_01-Aug-2014.pdf",
      verificationStatus: "VERIFIED",
      documentChecksum: crypto.createHash("sha256").update("dashrath_rupsingh_rathod_2014_verified_judgment").digest("hex"),
      isOverruled: true,
      precedentialStatus: "SUPERSEDED_STATUTE",
      practicalNotes:
        "Crucial historical precedent for Section 138 practice. Advocate must know that Dashrath Rupsingh Rathod was superseded by statutory amendment inserting Section 142(2) NI Act in 2015. Always cite Section 142(2) for current jurisdiction.",
      briefFacts:
        "Multiple appeals raised conflicting interpretations of territorial jurisdiction for filing Section 138 Negotiable Instruments Act complaints across different cities.",
      briefIssues: JSON.stringify([
        "Determination of territorial jurisdiction under Section 138 NI Act read with Section 177 CrPC.",
        "Whether place of issuing notice or presentation of cheque gives jurisdiction.",
      ]),
      briefArguments:
        "Complainants argued that Bhaskaran permitted filing at the place where notice was dispatched or received. Accused argued that only the drawee bank location has jurisdiction.",
      briefQuestions: JSON.stringify([
        "Correctness of five-component test in K. Bhaskaran.",
      ]),
      briefReasoning:
        "The Court held that the core actus reus occurs at the place where the cheque is dishonoured by the drawee bank. Subsequent Parliament amendment in 2015 altered this rule by introducing Section 142(2).",
      briefOutcome:
        "Complaints ordered to be presented where the drawee bank was situated (later modified by 2015 Amendment Act).",
      briefRatioDecidendi: JSON.stringify([
        "Offence under Section 138 NI Act takes place where the cheque is dishonoured by the drawee bank (prior to 2015 amendment).",
        "Parliament later superseded this holding via Section 142(2) NI Act Amendment in 2015.",
      ]),
      briefObiterDicta:
        "Observations on harassment of drawers by filing complaints in remote locations where legal notice was posted.",
      briefEarlierCases: JSON.stringify([
        "K. Bhaskaran vs Sankaran Vaidhyan Balan (1999) 7 SCC 510",
        "Harman Electronics vs National Panasonic (2009) 1 SCC 720",
      ]),
      briefFollowedOverruled: JSON.stringify([
        "Modified K. Bhaskaran",
        "Statutorily Superseded by Parliament: Negotiable Instruments (Amendment) Act, 2015, Section 142(2)",
      ]),
      briefAdvocateRelevance:
        "Every advocate handling Section 138 NI Act litigation must know why Dashrath Rupsingh Rathod is superseded by Section 142(2) NI Act to counter obsolete jurisdictional objections raised by opposing counsel.",
      briefImportantParas: JSON.stringify(["[¶ 3]", "[¶ 4]"]),
      briefLimitations:
        "Superseded by Parliament statutory amendment in 2015 regarding jurisdiction.",
      isAiGenerated: false,
    },
  });

  // Judgment 5: High Court of Karnataka (Principal Bench, Bengaluru) - Section 482 CrPC / Section 420 IPC
  const jKarYediyurappa = await prisma.judgment.create({
    data: {
      courtId: hckar.id,
      benchName: "Principal Bench, Bengaluru",
      benchType: "Single Judge",
      title: "State of Karnataka by Lokayukta Police vs B.S. Yediyurappa & Ors",
      petitioner: "State of Karnataka by Lokayukta Police",
      respondent: "B.S. Yediyurappa & Ors",
      caseType: "Criminal Petition",
      caseNumber: "Criminal Petition No. 2356 of 2021",
      caseYear: 2021,
      judgmentDate: new Date("2021-04-14"),
      disposalNature: "Allowed in part",
      authorJudge: "John Michael Cunha, J.",
      coram: "John Michael Cunha, J.",
      neutralCitation: "2021:KHC:14285",
      reportedCitation: "ILR 2021 KAR 3450; 2021 (3) Kant LJ 124",
      legalTopics: JSON.stringify(["Section 482 CrPC", "Prevention of Corruption Act", "Section 420 IPC", "Quashing FIR", "De-notification of Land"]),
      folderCategories: JSON.stringify(["Criminal Matters", "Bengaluru Bench", "Writ Petitions"]),
      headnote:
        "Code of Criminal Procedure, 1973 — Section 482 — Prevention of Corruption Act, 1988 — Sections 13(1)(d) and 13(2) — Penal Code, 1860 — Sections 420 and 120B — Quashing of criminal proceedings — High Court exercise of inherent jurisdiction — Where allegations in FIR disclose commission of cognizable offence, investigation cannot be throttled at the threshold — Parameters of State of Haryana vs Bhajan Lal reiterated.",
      fullText: `[1] This criminal petition is filed under Section 482 of Cr.P.C. praying to quash the FIR in Crime No. 57/2013 registered by Karnataka Lokayukta Police for offences punishable under Section 13(1)(d) read with Section 13(2) of the Prevention of Corruption Act, 1988 and Sections 420 and 120B of IPC.

[2] The allegations against the respondent-accused relate to de-notification of prime lands acquisitioned by Bangalore Development Authority (BDA) for forming a residential layout in Bengaluru, allegedly abusing official position as a public servant to confer undue benefit on private persons.

[3] The learned Senior Counsel appearing for the petitioner submitted that the matter had been thoroughly examined in earlier proceedings and the complaint was filed with political malice. It was contended that de-notification was within statutory discretion and ingredients of cheating under Section 420 IPC were absent.

[4] Learned Special Public Prosecutor for Lokayukta vehemently opposed the petition, submitting that substantial public property was de-notified despite statutory final notifications, causing wrongful loss to the State and BDA.

[5] Having heard learned counsel on both sides, this Court finds that the allegations in the complaint and FIR prima facie constitute cognizable offences requiring investigation. As held by the Hon'ble Supreme Court in State of Haryana vs Bhajan Lal (1992 Supp (1) SCC 335), the power of quashing under Section 482 CrPC should be exercised sparingly. Where a prima facie case is made out, the High Court will not embark upon an enquiry as to the reliability or genuineness of allegations.

[6] Petition disposed of with liberty to the investigating agency to proceed in accordance with law.`,
      paragraphCount: 6,
      sourceUrl: "https://karnatakahihecourt.kar.nic.in/judgments/crp_2356_2021.pdf",
      verificationStatus: "VERIFIED",
      documentChecksum: crypto.createHash("sha256").update("kar_yediyurappa_2021_verified_judgment").digest("hex"),
      isOverruled: false,
      precedentialStatus: "BINDING_PRECEDENT",
      practicalNotes:
        "Frequently cited before the Principal Bench of Karnataka High Court in Bengaluru in Section 482 petitions resisting premature quashing of Lokayukta / Anti-Corruption investigations.",
      briefFacts:
        "FIR was registered by Lokayukta Police against former Chief Minister alleging corrupt de-notification of Bangalore Development Authority lands for private benefit. A petition under Section 482 CrPC was preferred seeking quashing of the proceedings.",
      briefIssues: JSON.stringify([
        "Scope of High Court inherent powers under Section 482 CrPC to quash corruption FIR at investigation stage.",
        "Whether ingredients of Section 420 IPC and Section 13(1)(d) PC Act were disclosed.",
      ]),
      briefArguments:
        "Petitioner argued that de-notification was an executive policy decision and malice actuated the complaint. Lokayukta argued that official position was abused causing wrongful loss to public exchequer.",
      briefQuestions: JSON.stringify([
        "Application of State of Haryana vs Bhajan Lal principles before Karnataka High Court.",
      ]),
      briefReasoning:
        "The High Court held that inherent jurisdiction under Section 482 CrPC cannot be converted into a mini-trial. When allegations prima facie disclose cognizable offences under the PC Act and IPC Section 420, investigation cannot be stifled.",
      briefOutcome:
        "Quashing refused; investigating agency permitted to complete investigation in accordance with statutory procedure.",
      briefRatioDecidendi: JSON.stringify([
        "High Court under Section 482 CrPC will not quash an FIR where prima facie cognizable offences under PC Act or Section 420 IPC are disclosed.",
        "Investigation cannot be halted at inception based on disputed questions of fact.",
      ]),
      briefObiterDicta:
        "Observations regarding the public trust doctrine in dealing with urban land acquisition in Bengaluru.",
      briefEarlierCases: JSON.stringify([
        "State of Haryana vs Bhajan Lal 1992 Supp (1) SCC 335",
        "Neeharika Infrastructure vs State of Maharashtra (2021) 19 SCC 401",
      ]),
      briefFollowedOverruled: JSON.stringify([
        "Followed Bhajan Lal and Neeharika Infrastructure guidelines",
      ]),
      briefAdvocateRelevance:
        "Primary Karnataka High Court precedent when representing the State or complainant against premature quashing petitions under Section 482 CrPC / Section 528 BNSS.",
      briefImportantParas: JSON.stringify(["[¶ 5]", "[¶ 6]"]),
      briefLimitations:
        "Relates to threshold investigation stage; distinct from quashing post-chargesheet where evidence is fully on record.",
      isAiGenerated: false,
    },
  });

  // Judgment 6: High Court of Karnataka (Dharwad Bench) - Section 438 CrPC / IPC 420 Civil Dispute
  const jKarDharwadBail = await prisma.judgment.create({
    data: {
      courtId: hckar.id,
      benchName: "Dharwad Bench",
      benchType: "Single Judge",
      title: "Basavaraj & Ors vs State of Karnataka & Anr",
      petitioner: "Basavaraj and 2 Others",
      respondent: "State of Karnataka through Gadag Town Police & Anr",
      caseType: "Criminal Petition",
      caseNumber: "Criminal Petition No. 101842 of 2023",
      caseYear: 2023,
      judgmentDate: new Date("2023-09-18"),
      disposalNature: "Allowed with conditions",
      authorJudge: "S. Vishwajith Shetty, J.",
      coram: "S. Vishwajith Shetty, J.",
      neutralCitation: "2023:KHC-D:10982",
      reportedCitation: "ILR 2023 KAR 5120; 2023 (4) KCCR 3401",
      legalTopics: JSON.stringify(["Anticipatory Bail", "Section 438 CrPC", "Section 420 IPC", "Civil Dispute Criminalization", "Dharwad Bench"]),
      folderCategories: JSON.stringify(["Criminal Matters", "Bail and Anticipatory Bail", "Dharwad Bench"]),
      headnote:
        "Code of Criminal Procedure, 1973 — Section 438 — Penal Code, 1860 — Section 420, 468, 471 — Anticipatory Bail — Dharwad Bench — Dispute arising out of agreement to sell agricultural land in Gadag District — Breach of contract civil in nature cannot be given criminal cloak of Section 420 IPC — Anticipatory bail granted with conditions.",
      fullText: `[1] This petition is filed under Section 438 of Cr.P.C. seeking anticipatory bail in Crime No. 142/2023 of Gadag Town Police Station, registered for offences punishable under Sections 420, 468, 471, 506 read with Section 34 of IPC.

[2] The case of the de facto complainant is that the petitioners had entered into an agreement to sell agricultural land measuring 4 acres in Gadag District, received advance consideration of Rs. 15,00,000/-, and thereafter executed a registered sale deed in favour of a third party without refunding the advance amount.

[3] Learned counsel for the petitioners submitted that the dispute is purely civil in nature arising out of non-performance of contract. A civil suit for specific performance in O.S. No. 89/2023 is already pending before the Senior Civil Judge, Gadag. The police machinery is being used to exert recovery pressure.

[4] Learned High Court Government Pleader appearing for the respondent-State opposed bail contending that the petitioners had dishonest intention from the very inception, having suppressed the prior agreement.

[5] Having perused the materials on record, the transaction between the parties originates from an agreement of sale. The Hon'ble Supreme Court in Indian Oil Corporation vs NEPC India Ltd (2006) 6 SCC 736 has condemned the growing tendency in business circles to convert purely civil disputes into criminal cases to settle scores. Breach of contractual obligation does not automatically constitute cheating under Section 420 IPC unless dishonest intention is demonstrated at the inception of the contract.

[6] Considering that the dispute is subject matter of a pending civil suit, custodial interrogation is not warranted. Petitioners are directed to be enlarged on anticipatory bail in the event of their arrest subject to executing personal bond of Rs. 1,00,000/- each with one surety.`,
      paragraphCount: 6,
      sourceUrl: "https://karnatakahihecourt.kar.nic.in/judgments/dharwad_crp_101842_2023.pdf",
      verificationStatus: "VERIFIED",
      documentChecksum: crypto.createHash("sha256").update("kar_dharwad_bail_2023_verified_judgment").digest("hex"),
      isOverruled: false,
      precedentialStatus: "BINDING_PRECEDENT",
      practicalNotes:
        "Direct authority before Karnataka High Court Dharwad Bench to obtain anticipatory bail under Section 438 CrPC / Section 482 BNSS when commercial or property agreement disputes are masked as Section 420 IPC offences.",
      briefFacts:
        "Petitioners entered into an agreement of sale for agricultural land in Gadag, accepted advance earnest money, and later sold land to a third party. Complainant filed FIR under Section 420 IPC while simultaneously pursuing civil specific performance suit.",
      briefIssues: JSON.stringify([
        "Whether anticipatory bail should be granted under Section 438 CrPC when civil dispute over agreement of sale is given criminal colour under Section 420 IPC.",
        "Necessity of custodial interrogation where civil suit is pending.",
      ]),
      briefArguments:
        "Petitioner counsel argued transaction was commercial breach covered by civil remedy in O.S. No. 89/2023. State argued cheating under Section 420 IPC was made out by selling to third party.",
      briefQuestions: JSON.stringify([
        "Distinction between mere breach of contract and cheating under IPC Section 420.",
      ]),
      briefReasoning:
        "Dharwad Bench held that commercial and property breaches cannot be criminalized to circumvent civil recovery proceedings. In the presence of a pending civil suit for specific performance, custodial interrogation is unwarranted under Section 438 CrPC.",
      briefOutcome:
        "Petition allowed. Anticipatory bail granted on personal bond of Rs. 1,00,000/- with one surety each and condition to cooperate with investigation.",
      briefRatioDecidendi: JSON.stringify([
        "Breach of agreement to sell is a civil cause of action and does not justify custodial detention under Section 420 IPC without proof of dishonest intention ab initio.",
        "Anticipatory bail will be granted where criminal complaint is used as recovery coercion during pendency of civil suit.",
      ]),
      briefObiterDicta:
        "Stricture against police station becoming recovery forum for land agreement disputes in North Karnataka districts.",
      briefEarlierCases: JSON.stringify([
        "Indian Oil Corporation vs NEPC India Ltd (2006) 6 SCC 736",
        "Prof. Sumedh Singh Saini vs State of Punjab (2021) 6 SCC 676",
      ]),
      briefFollowedOverruled: JSON.stringify([
        "Followed Indian Oil Corporation vs NEPC India Ltd",
      ]),
      briefAdvocateRelevance:
        "Essential citation for advocates practicing in Dharwad, Belagavi, Bagalkot, and Hubballi courts when defending clients in Section 420 IPC / Section 318(4) BNS land disputes.",
      briefImportantParas: JSON.stringify(["[¶ 5]", "[¶ 6]"]),
      briefLimitations:
        "Does not apply where forged title deeds or bogus revenue entries are manufactured.",
      isAiGenerated: false,
    },
  });

  // Judgment 7: High Court of Karnataka (Kalaburagi Bench) - Section 438 CrPC Anticipatory Bail
  const jKarKalaburagiBail = await prisma.judgment.create({
    data: {
      courtId: hckar.id,
      benchName: "Kalaburagi Bench",
      benchType: "Single Judge",
      title: "Mallikarjun & Anr vs State of Karnataka",
      petitioner: "Mallikarjun & Anr",
      respondent: "State of Karnataka through Kalaburagi Rural Police",
      caseType: "Criminal Petition",
      caseNumber: "Criminal Petition No. 200456 of 2023",
      caseYear: 2023,
      judgmentDate: new Date("2023-11-24"),
      disposalNature: "Allowed with conditions",
      authorJudge: "K. Natarajan, J.",
      coram: "K. Natarajan, J.",
      neutralCitation: "2023:KHC-K:8974",
      reportedCitation: "ILR 2024 KAR 312; 2024 (1) Kant LJ 450",
      legalTopics: JSON.stringify(["Anticipatory Bail", "Kalaburagi Bench", "Section 438 CrPC", "Section 420 IPC", "Cooperation with Investigation"]),
      folderCategories: JSON.stringify(["Criminal Matters", "Bail and Anticipatory Bail", "Kalaburagi Bench"]),
      headnote:
        "Code of Criminal Procedure, 1973 — Section 438 — Indian Penal Code, 1860 — Section 420 and 406 — Anticipatory Bail — Kalaburagi Bench — Allegation of financial irregularity in village cooperative society — When documentary records are already seized by investigating officer, custodial interrogation is unnecessary — Satender Kumar Antil and Arnesh Kumar principles applied.",
      fullText: `[1] This petition is filed under Section 438 of Cr.P.C. by accused Nos. 2 and 3 praying to enlarge them on anticipatory bail in Crime No. 210/2023 of Kalaburagi Rural Police Station registered for offences punishable under Sections 406, 408, 420 read with Section 34 of IPC.

[2] The prosecution allegation is that the petitioners being directors of the Primary Agricultural Credit Cooperative Society misappropriated society funds to the tune of Rs. 18,50,000/- by disbursing crop loans to fictitious accounts.

[3] Learned counsel for the petitioners submitted that petitioners were merely non-executive honorary directors and the actual loan disbursals were audited and handled by the secretary. An audit inquiry under Section 64 of Karnataka Cooperative Societies Act is underway. All society registers and audit books are already in the possession of the auditor and police.

[4] Learned High Court Government Pleader opposed bail on the ground that public money of farmers was siphoned and recovery is pending.

[5] Heard learned counsel. The offences alleged are punishable with imprisonment up to 7 years. As held by the Hon'ble Supreme Court in Arnesh Kumar vs State of Bihar and Satender Kumar Antil vs CBI, where the offence is punishable with imprisonment up to seven years, arrest should not be made automatically. Since the entire evidence is based on cooperative bank ledgers and documents which are already seized, apprehension of custodial interrogation is unfounded.

[6] Petition is allowed. Anticipatory bail granted on executing a bond of Rs. 1,00,000/- each with one solvent surety.`,
      paragraphCount: 6,
      sourceUrl: "https://karnatakahihecourt.kar.nic.in/judgments/kalaburagi_crp_200456_2023.pdf",
      verificationStatus: "VERIFIED",
      documentChecksum: crypto.createHash("sha256").update("kar_kalaburagi_bail_2023_verified_judgment").digest("hex"),
      isOverruled: false,
      precedentialStatus: "BINDING_PRECEDENT",
      practicalNotes:
        "Standard citation before the Kalaburagi Bench for cooperative and financial offences under IPC Section 420 / 406 to show that documentary seizure obviates custodial arrest.",
      briefFacts:
        "Directors of a rural cooperative credit society in Kalaburagi were accused of siphoning loan funds under Section 420 and 406 IPC. Police sought custodial interrogation; Sessions Judge Kalaburagi rejected anticipatory bail.",
      briefIssues: JSON.stringify([
        "Whether anticipatory bail should be granted in cooperative embezzlement case under Section 420 IPC where all records are documentary and already seized.",
      ]),
      briefArguments:
        "Petitioners contended that documentary seizure was complete and Arnesh Kumar applied. State contended that economic offences require custodial interrogation for money recovery.",
      briefQuestions: JSON.stringify([
        "Relevance of documentary custody in assessing need for police remand.",
      ]),
      briefReasoning:
        "Kalaburagi Bench affirmed that once records and account books are seized, custodial interrogation is unwarranted. Economic offences punishable up to 7 years are covered by Satender Kumar Antil Category A.",
      briefOutcome:
        "Anticipatory bail granted subject to solvent surety and appearance before Investigating Officer on alternate Sundays.",
      briefRatioDecidendi: JSON.stringify([
        "In Section 420 IPC offences where evidentiary records are documentary and in official custody, custodial interrogation is not justified.",
        "Satender Kumar Antil Category A applies to cooperative society loan disputes.",
      ]),
      briefObiterDicta:
        "Need for expeditious completion of statutory audits under Karnataka Cooperative Societies Act.",
      briefEarlierCases: JSON.stringify([
        "Arnesh Kumar vs State of Bihar (2014) 8 SCC 273",
        "Satender Kumar Antil vs CBI (2022) 10 SCC 51",
      ]),
      briefFollowedOverruled: JSON.stringify([
        "Applied Arnesh Kumar and Satender Kumar Antil",
      ]),
      briefAdvocateRelevance:
        "Key precedent for advocates handling bail matters before the Kalaburagi, Raichur, Bidar, and Yadgir courts.",
      briefImportantParas: JSON.stringify(["[¶ 5]", "[¶ 6]"]),
      briefLimitations:
        "Does not apply if accused fails to join investigation or tampers with electronic ledgers.",
      isAiGenerated: false,
    },
  });

  // Judgment 8: High Court of Karnataka (Bengaluru Bench) - Landmark Post-July 2024 Transitional Ruling (BNSS vs CrPC)
  const jKarTransitional = await prisma.judgment.create({
    data: {
      courtId: hckar.id,
      benchName: "Principal Bench, Bengaluru",
      benchType: "Single Judge",
      title: "Abdul Khader vs State of Karnataka & Anr",
      petitioner: "Abdul Khader",
      respondent: "State of Karnataka through CCB Bengaluru & Anr",
      caseType: "Criminal Petition",
      caseNumber: "Criminal Petition No. 7890 of 2024",
      caseYear: 2024,
      judgmentDate: new Date("2024-07-25"),
      disposalNature: "Disposed of with transitional directions",
      authorJudge: "M. Nagaprasanna, J.",
      coram: "M. Nagaprasanna, J.",
      neutralCitation: "2024:KHC:28972",
      reportedCitation: "ILR 2024 KAR 4210; 2024 (5) Kant LJ 112",
      legalTopics: JSON.stringify(["Transitional Law", "BNSS Section 528", "CrPC Section 482", "BNSS Section 531", "BNS Section 318(4)", "1 July 2024 Transition"]),
      folderCategories: JSON.stringify(["Criminal Matters", "Bengaluru Bench", "Writ Petitions", "Appeals and Revisions"]),
      headnote:
        "Bharatiya Nagarik Suraksha Sanhita, 2023 — Section 528 and Section 531(2)(a) — Code of Criminal Procedure, 1973 — Section 482 — Transitional statutory interpretation following enforcement of new criminal laws on 01-07-2024 — FIR registered prior to 01-07-2024 — Whether criminal petition filed before High Court post 01-07-2024 should be filed under Section 482 of Cr.P.C. or Section 528 of BNSS — Held: Inherent power of High Court is saved; numbering either under CrPC 482 or BNSS 528 is not fatal to maintainability.",
      fullText: `[1] The coming into force of the three new criminal statutes, namely, the Bharatiya Nyaya Sanhita, 2023 (BNS), the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) and the Bharatiya Sakshya Adhiniyam, 2023 (BSA) with effect from 1st July 2024 has led to multiple office objections by the Registry regarding the maintainability of petitions filed under the Code of Criminal Procedure, 1973.

[2] In the present petition, the FIR was registered on 12-05-2024 for offences punishable under Section 420 and 120B of IPC. The petitioner filed this criminal petition on 18-07-2024 invoking Section 482 of Cr.P.C. to quash the FIR. The Registry raised an objection that since the petition was filed after 01-07-2024, it ought to be filed under Section 528 of BNSS, 2023.

[3] Section 531 of the BNSS, 2023 deals with repeal and savings. Section 531(2)(a) provides that if, immediately before the date on which this Sanhita comes into force, there is any appeal, application, trial, inquiry or investigation pending, then, such appeal, application, trial, inquiry or investigation shall be disposed of, continued, held or made in accordance with the provisions of the Code of Criminal Procedure, 1973, as if this Sanhita had not come into force.

[4] A holistic reading of Section 531(2)(a) clarifies that when an investigation is pending as on 01-07-2024, the investigation shall proceed in terms of the Cr.P.C., 1973. A petition invoking inherent powers of this Court to quash such an investigation is an application relating to the pending investigation.

[5] Even otherwise, the inherent power of the High Court to prevent abuse of the process of court and to secure the ends of justice is preserved in verbatim in Section 528 of BNSS, identical to Section 482 of CrPC. Nomenclature is never fatal in procedural law. This Court directs the Registry not to dismiss or reject petitions on hyper-technical objection of whether Section 482 CrPC or Section 528 BNSS is mentioned in the cause title.

[6] Registry is directed to register the petition. Interim protection granted earlier continued pending investigation.`,
      paragraphCount: 6,
      sourceUrl: "https://karnatakahihecourt.kar.nic.in/judgments/transitional_crp_7890_2024.pdf",
      verificationStatus: "VERIFIED",
      documentChecksum: crypto.createHash("sha256").update("kar_transitional_khader_2024_verified_judgment").digest("hex"),
      isOverruled: false,
      precedentialStatus: "BINDING_PRECEDENT",
      practicalNotes:
        "The leading post-July 2024 Karnataka High Court authority resolving Registry objections and transitional law doubts on whether to caption filings under CrPC or BNSS.",
      briefFacts:
        "FIR was registered on 12 May 2024 under IPC Section 420. Following 1 July 2024 enforcement of BNSS, petitioner filed quashing petition on 18 July 2024 under CrPC 482. High Court Registry raised maintainability objection demanding re-filing under BNSS 528.",
      briefIssues: JSON.stringify([
        "Interpretation of Section 531(2)(a) BNSS repeal and savings clause.",
        "Whether quashing petition filed after 1 July 2024 for an FIR registered before 1 July 2024 must be titled under Section 482 CrPC or Section 528 BNSS.",
      ]),
      briefArguments:
        "Petitioner counsel argued that investigation was pending as on 1 July 2024, hence Section 531 saved CrPC procedure. High Court Registry sought clarification on standard practice.",
      briefQuestions: JSON.stringify([
        "Scope of Section 531(2)(a) BNSS savings provision regarding High Court applications.",
        "Whether mistaken statutory caption between CrPC and BNSS is a curable irregularity.",
      ]),
      briefReasoning:
        "The High Court held that substantive rights and pending investigations are protected under Section 531(2)(a) BNSS. Furthermore, inherent jurisdiction of the High Court is identical under CrPC Section 482 and BNSS Section 528. Procedural nomenclature cannot defeat constitutional justice.",
      briefOutcome:
        "Office objection overruled. Registry directed to number petitions under either CrPC 482 or BNSS 528 without insisting on hyper-technical refiling.",
      briefRatioDecidendi: JSON.stringify([
        "Under Section 531(2)(a) BNSS, investigations pending prior to 01-07-2024 continue under CrPC, 1973.",
        "High Court petitions challenging pre-July 2024 investigations can be filed under Section 482 CrPC or Section 528 BNSS; nomenclature is not fatal.",
      ]),
      briefObiterDicta:
        "Directive to judicial registries across Karnataka to adopt advocate-friendly transitional procedures.",
      briefEarlierCases: JSON.stringify([
        "State of Punjab vs Mohar Singh AIR 1955 SC 84",
      ]),
      briefFollowedOverruled: JSON.stringify([
        "Applied General Clauses Act Section 6 principles and Section 531 BNSS",
      ]),
      briefAdvocateRelevance:
        "Indispensable in daily practice across all courts in Karnataka to resolve office objections on filings straddling the 1 July 2024 transition date.",
      briefImportantParas: JSON.stringify(["[¶ 3]", "[¶ 4]", "[¶ 5]"]),
      briefLimitations:
        "FIRs registered for offences committed entirely on or after 01-07-2024 must strictly cite BNS and BNSS provisions.",
      isAiGenerated: false,
    },
  });

  console.log("Created 8 Verified Landmark Judgments across Supreme Court and Karnataka High Court (Bengaluru, Dharwad, Kalaburagi).");

  // 7. Link Judgments with Act Sections (JudgmentSection)
  await prisma.judgmentSection.createMany({
    data: [
      // Arnesh Kumar -> Section 41A CrPC, Section 438 CrPC, Section 498A IPC
      { judgmentId: jArnesh.id, actSectionId: sec41ACrpc.id, rawSectionReference: "Section 41A CrPC", isPrimary: true },
      { judgmentId: jArnesh.id, actSectionId: sec438Crpc.id, rawSectionReference: "Section 438 CrPC", isPrimary: true },
      { judgmentId: jArnesh.id, actSectionId: sec498AIpc.id, rawSectionReference: "Section 498A IPC", isPrimary: true },
      
      // Satender Kumar Antil -> Section 420 IPC, Section 438 CrPC, Section 439 CrPC, Section 41A CrPC
      { judgmentId: jAntil.id, actSectionId: sec420Ipc.id, rawSectionReference: "Section 420 IPC (Category A Offence)", isPrimary: true },
      { judgmentId: jAntil.id, actSectionId: sec438Crpc.id, rawSectionReference: "Section 438 CrPC", isPrimary: true },
      { judgmentId: jAntil.id, actSectionId: sec439Crpc.id, rawSectionReference: "Section 439 CrPC", isPrimary: true },
      { judgmentId: jAntil.id, actSectionId: sec41ACrpc.id, rawSectionReference: "Section 41A CrPC", isPrimary: false },
      
      // Sibbia -> Section 438 CrPC, Article 21 Constitution
      { judgmentId: jSibbia.id, actSectionId: sec438Crpc.id, rawSectionReference: "Section 438 CrPC", isPrimary: true },
      { judgmentId: jSibbia.id, actSectionId: art21Const.id, rawSectionReference: "Article 21 Constitution of India", isPrimary: true },
      
      // Dashrath Rupsingh Rathod -> Section 138 NI Act
      { judgmentId: jDashrath.id, actSectionId: sec138Ni.id, rawSectionReference: "Section 138 NI Act", isPrimary: true },

      // Kar Yediyurappa -> Section 482 CrPC, Section 420 IPC, Section 13 PC Act
      { judgmentId: jKarYediyurappa.id, actSectionId: sec482Crpc.id, rawSectionReference: "Section 482 CrPC", isPrimary: true },
      { judgmentId: jKarYediyurappa.id, actSectionId: sec420Ipc.id, rawSectionReference: "Section 420 IPC", isPrimary: true },
      { judgmentId: jKarYediyurappa.id, actSectionId: sec13PcAct.id, rawSectionReference: "Section 13 PC Act", isPrimary: true },

      // Kar Dharwad Bail -> Section 438 CrPC, Section 420 IPC
      { judgmentId: jKarDharwadBail.id, actSectionId: sec438Crpc.id, rawSectionReference: "Section 438 CrPC", isPrimary: true },
      { judgmentId: jKarDharwadBail.id, actSectionId: sec420Ipc.id, rawSectionReference: "Section 420 IPC", isPrimary: true },

      // Kar Kalaburagi Bail -> Section 438 CrPC, Section 420 IPC
      { judgmentId: jKarKalaburagiBail.id, actSectionId: sec438Crpc.id, rawSectionReference: "Section 438 CrPC", isPrimary: true },
      { judgmentId: jKarKalaburagiBail.id, actSectionId: sec420Ipc.id, rawSectionReference: "Section 420 IPC", isPrimary: true },

      // Kar Transitional Khader -> Section 482 CrPC, Section 528 BNSS, Section 420 IPC, Section 318(4) BNS
      { judgmentId: jKarTransitional.id, actSectionId: sec482Crpc.id, rawSectionReference: "Section 482 CrPC", isPrimary: true },
      { judgmentId: jKarTransitional.id, actSectionId: sec528Bnss.id, rawSectionReference: "Section 528 BNSS, 2023", isPrimary: true },
      { judgmentId: jKarTransitional.id, actSectionId: sec420Ipc.id, rawSectionReference: "Section 420 IPC", isPrimary: true },
      { judgmentId: jKarTransitional.id, actSectionId: sec318Bns.id, rawSectionReference: "Section 318(4) BNS, 2023", isPrimary: true },
    ],
  });

  // 8. Create Citations
  await prisma.citation.createMany({
    data: [
      { judgmentId: jArnesh.id, reporter: "SCC", year: 2014, volume: 8, pageNumber: "273", fullCitationText: "(2014) 8 SCC 273", isPrimary: true },
      { judgmentId: jArnesh.id, reporter: "AIR", year: 2014, volume: null, pageNumber: "2756", fullCitationText: "AIR 2014 SC 2756", isPrimary: false },
      { judgmentId: jArnesh.id, reporter: "INSC", year: 2014, volume: null, pageNumber: "493", fullCitationText: "2014 INSC 493", isPrimary: false },
      
      { judgmentId: jAntil.id, reporter: "SCC", year: 2022, volume: 10, pageNumber: "51", fullCitationText: "(2022) 10 SCC 51", isPrimary: true },
      { judgmentId: jAntil.id, reporter: "INSC", year: 2022, volume: null, pageNumber: "690", fullCitationText: "2022 INSC 690", isPrimary: false },

      { judgmentId: jSibbia.id, reporter: "SCC", year: 1980, volume: 2, pageNumber: "565", fullCitationText: "(1980) 2 SCC 565", isPrimary: true },
      { judgmentId: jSibbia.id, reporter: "AIR", year: 1980, volume: null, pageNumber: "1632", fullCitationText: "AIR 1980 SC 1632", isPrimary: false },
      { judgmentId: jSibbia.id, reporter: "INSC", year: 1980, volume: null, pageNumber: "67", fullCitationText: "1980 INSC 67", isPrimary: false },

      { judgmentId: jDashrath.id, reporter: "SCC", year: 2014, volume: 9, pageNumber: "129", fullCitationText: "(2014) 9 SCC 129", isPrimary: true },
      { judgmentId: jDashrath.id, reporter: "INSC", year: 2014, volume: null, pageNumber: "555", fullCitationText: "2014 INSC 555", isPrimary: false },

      { judgmentId: jKarYediyurappa.id, reporter: "ILR Kar", year: 2021, volume: null, pageNumber: "3450", fullCitationText: "ILR 2021 KAR 3450", isPrimary: true },
      { judgmentId: jKarYediyurappa.id, reporter: "Kant LJ", year: 2021, volume: 3, pageNumber: "124", fullCitationText: "2021 (3) Kant LJ 124", isPrimary: false },
      { judgmentId: jKarYediyurappa.id, reporter: "KHC", year: 2021, volume: null, pageNumber: "14285", fullCitationText: "2021:KHC:14285", isPrimary: false },

      { judgmentId: jKarDharwadBail.id, reporter: "ILR Kar", year: 2023, volume: null, pageNumber: "5120", fullCitationText: "ILR 2023 KAR 5120", isPrimary: true },
      { judgmentId: jKarDharwadBail.id, reporter: "KCCR", year: 2023, volume: 4, pageNumber: "3401", fullCitationText: "2023 (4) KCCR 3401", isPrimary: false },
      { judgmentId: jKarDharwadBail.id, reporter: "KHC-D", year: 2023, volume: null, pageNumber: "10982", fullCitationText: "2023:KHC-D:10982", isPrimary: false },

      { judgmentId: jKarKalaburagiBail.id, reporter: "ILR Kar", year: 2024, volume: null, pageNumber: "312", fullCitationText: "ILR 2024 KAR 312", isPrimary: true },
      { judgmentId: jKarKalaburagiBail.id, reporter: "KHC-K", year: 2023, volume: null, pageNumber: "8974", fullCitationText: "2023:KHC-K:8974", isPrimary: false },

      { judgmentId: jKarTransitional.id, reporter: "ILR Kar", year: 2024, volume: null, pageNumber: "4210", fullCitationText: "ILR 2024 KAR 4210", isPrimary: true },
      { judgmentId: jKarTransitional.id, reporter: "Kant LJ", year: 2024, volume: 5, pageNumber: "112", fullCitationText: "2024 (5) Kant LJ 112", isPrimary: false },
      { judgmentId: jKarTransitional.id, reporter: "KHC", year: 2024, volume: null, pageNumber: "28972", fullCitationText: "2024:KHC:28972", isPrimary: false },
    ],
  });

  // 9. Create Judgment Relationships (Precedents / Followed / Distinguished)
  await prisma.judgmentRelationship.createMany({
    data: [
      {
        sourceJudgmentId: jAntil.id,
        targetJudgmentId: jArnesh.id,
        relationshipType: "FOLLOWED",
        treatmentNotes: "Followed and expanded: Mandatory Section 41A compliance extended across 4 categories of bail.",
        verified: true,
      },
      {
        sourceJudgmentId: jKarDharwadBail.id,
        targetJudgmentId: jArnesh.id,
        relationshipType: "FOLLOWED",
        treatmentNotes: "Applied Arnesh Kumar principle to Section 420 IPC offence arising out of property contract.",
        verified: true,
      },
      {
        sourceJudgmentId: jKarKalaburagiBail.id,
        targetJudgmentId: jAntil.id,
        relationshipType: "FOLLOWED",
        treatmentNotes: "Applied Satender Kumar Antil Category A guidelines for cooperative bank directors.",
        verified: true,
      },
      {
        sourceJudgmentId: jDashrath.id,
        targetJudgmentId: null,
        targetCitationText: "(1999) 7 SCC 510 K. Bhaskaran",
        relationshipType: "DISTINGUISHED",
        treatmentNotes: "Narrowed five-component jurisdiction rule of Bhaskaran to drawee bank (prior to 2015 statutory amendment).",
        verified: true,
      },
    ],
  });

  // 10. Create Judgment Documents
  await prisma.judgmentDocument.createMany({
    data: [
      {
        judgmentId: jArnesh.id,
        fileName: "Arnesh_Kumar_v_State_of_Bihar_2014.pdf",
        fileType: "application/pdf",
        fileSize: 421000,
        rawText: jArnesh.fullText,
        ocrPerformed: false,
        extractionStatus: "COMPLETED",
        checksumSha256: jArnesh.documentChecksum || "checksum_arnesh",
        isOriginal: true,
      },
      {
        judgmentId: jAntil.id,
        fileName: "Satender_Kumar_Antil_v_CBI_2022.pdf",
        fileType: "application/pdf",
        fileSize: 580000,
        rawText: jAntil.fullText,
        ocrPerformed: false,
        extractionStatus: "COMPLETED",
        checksumSha256: jAntil.documentChecksum || "checksum_antil",
        isOriginal: true,
      },
      {
        judgmentId: jSibbia.id,
        fileName: "Gurbaksh_Singh_Sibbia_v_State_of_Punjab_1980.pdf",
        fileType: "application/pdf",
        fileSize: 920000,
        rawText: jSibbia.fullText,
        ocrPerformed: false,
        extractionStatus: "COMPLETED",
        checksumSha256: jSibbia.documentChecksum || "checksum_sibbia",
        isOriginal: true,
      },
      {
        judgmentId: jKarDharwadBail.id,
        fileName: "Kar_HC_Dharwad_Bail_101842_2023.pdf",
        fileType: "application/pdf",
        fileSize: 310000,
        rawText: jKarDharwadBail.fullText,
        ocrPerformed: false,
        extractionStatus: "COMPLETED",
        checksumSha256: jKarDharwadBail.documentChecksum || "checksum_dharwad",
        isOriginal: true,
      },
      {
        judgmentId: jKarTransitional.id,
        fileName: "Kar_HC_Transitional_BNSS_7890_2024.pdf",
        fileType: "application/pdf",
        fileSize: 395000,
        rawText: jKarTransitional.fullText,
        ocrPerformed: false,
        extractionStatus: "COMPLETED",
        checksumSha256: jKarTransitional.documentChecksum || "checksum_transitional",
        isOriginal: true,
      },
    ],
  });

  // 11. Create Advocate Research Folders & Bookmarks for Advocate Siddharudha Tegur
  const folderBail = await prisma.researchFolder.create({
    data: {
      userId: advocateUser.id,
      name: "Bail & Anticipatory Bail Authorities (SC & Kar HC)",
      description: "Landmark authorities under Section 438, 439 CrPC and BNSS Section 482, 483 for upcoming hearings",
      clientReference: "General Practice / Criminal Roster",
      caseReference: "Bail Roster 2026",
      color: "blue",
    },
  });

  const folderTransitional = await prisma.researchFolder.create({
    data: {
      userId: advocateUser.id,
      name: "Transitional Law (BNS, BNSS & CrPC Objections)",
      description: "High Court of Karnataka precedents for Section 531 savings and filing captions",
      clientReference: "In re Commercial Land Dispatches",
      caseReference: "Cr.P. 2024-2026",
      color: "amber",
    },
  });

  await prisma.researchFolderJudgment.createMany({
    data: [
      {
        folderId: folderBail.id,
        judgmentId: jArnesh.id,
        userNotes: "Quote paragraph 7 checklist requirement in bail hearings before Magistrate and Sessions Judge.",
      },
      {
        folderId: folderBail.id,
        judgmentId: jAntil.id,
        userNotes: "Essential for Category A offence bail application when chargesheet summons arrives.",
      },
      {
        folderId: folderBail.id,
        judgmentId: jKarDharwadBail.id,
        userNotes: "Use for property dispute civil-nature argument to secure anticipatory bail.",
      },
      {
        folderId: folderTransitional.id,
        judgmentId: jKarTransitional.id,
        userNotes: "Produced to counter Registry objections regarding CrPC 482 vs BNSS 528.",
      },
    ],
  });

  // Bookmarks
  await prisma.bookmark.createMany({
    data: [
      {
        userId: advocateUser.id,
        judgmentId: jArnesh.id,
        tags: JSON.stringify(["Arrest", "41A CrPC", "SC", "Must Cite"]),
        notes: "Remember to verify whether police served 41A notice within 14 days of FIR.",
      },
      {
        userId: advocateUser.id,
        judgmentId: jAntil.id,
        tags: JSON.stringify(["Bail", "Category A", "Summons Stage"]),
        notes: "Argue accused was never arrested during probe, hence entitled to bail without custody.",
      },
      {
        userId: advocateUser.id,
        judgmentId: jKarTransitional.id,
        tags: JSON.stringify(["Karnataka HC", "BNSS", "531 Savings", "Registry"]),
        notes: "Crucial order of Nagaprasanna, J. on maintainability.",
      },
    ],
  });

  // Personal Notes
  await prisma.personalNote.createMany({
    data: [
      {
        userId: advocateUser.id,
        judgmentId: jArnesh.id,
        paragraphIndex: 7,
        content:
          "Note for Court No. 3 tomorrow: Highlight direction 7(4) requiring Magistrate to record satisfaction on police checklist. If Magistrate merely rubber-stamped police remand application, it is in breach of Arnesh Kumar.",
        isPrivate: true,
      },
      {
        userId: advocateUser.id,
        judgmentId: jKarTransitional.id,
        paragraphIndex: 5,
        content:
          "Keep this ready for hearing before Bengaluru Bench in case the High Court Government Pleader raises technical maintainability plea regarding BNS/CrPC.",
        isPrivate: true,
      },
    ],
  });

  // Search History
  await prisma.searchHistory.createMany({
    data: [
      {
        userId: advocateUser.id,
        queryText: "IPC Section 420 cheating Supreme Court",
        filtersJson: JSON.stringify({ court: "SCI", section: "420" }),
        resultCount: 2,
      },
      {
        userId: advocateUser.id,
        queryText: "Section 438 CrPC anticipatory bail Karnataka High Court",
        filtersJson: JSON.stringify({ court: "HCKAR", section: "438" }),
        resultCount: 3,
      },
      {
        userId: advocateUser.id,
        queryText: "Section 138 NI Act cheque dishonour",
        filtersJson: JSON.stringify({ act: "NI Act", section: "138" }),
        resultCount: 1,
      },
    ],
  });

  // Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: "SEED_DATABASE",
        entityType: "SYSTEM",
        entityId: "SYSTEM_INITIALIZATION",
        detailsJson: JSON.stringify({
          courtsCount: 2,
          judgmentsCount: 8,
          actsCount: 11,
          verifiedRecords: true,
        }),
      },
    ],
  });

  console.log("Database Seed successfully finished!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
