# ADVOCATE LEGAL JUDGMENT RESEARCH SYSTEM — INDIA
### Supreme Court of India | High Court of Karnataka

A professional, production-oriented digital law library and judgment research system designed **exclusively for practicing advocates and legal professionals in India**.

---

## 1. System Architecture & Features

- **Primary Courts Supported**:
  1. **Supreme Court of India** (Apex Court: Tilak Marg, New Delhi)
  2. **High Court of Karnataka** (Principal Bench Bengaluru, Dharwad Bench, Kalaburagi Bench)
- **Act & Section Library**:
  - **Criminal Law**: Indian Penal Code, 1860 (IPC), Code of Criminal Procedure, 1973 (CrPC), Indian Evidence Act, 1872 (IEA), Bharatiya Nyaya Sanhita, 2023 (BNS), Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS), Bharatiya Sakshya Adhiniyam, 2023 (BSA).
  - **Civil & Commercial Legislation**: Constitution of India, Code of Civil Procedure, 1908 (CPC), Negotiable Instruments Act, 1881 (NI Act), Prevention of Corruption Act, 1988 (PC Act), Protection of Women from Domestic Violence Act, 2005 (DV Act).
- **Statutory Transitional Handling (1 July 2024)**:
  - BNS, BNSS, and BSA came into force on 1 July 2024.
  - Automatically identifies corresponding sections:
    - IPC Section 420 &harr; BNS Section 318(4) (`VERIFIED EQUIVALENCE`)
    - CrPC Section 438 &harr; BNSS Section 482 (`VERIFIED EQUIVALENCE`)
    - CrPC Section 482 &harr; BNSS Section 528 (`VERIFIED EQUIVALENCE`)
    - IPC Section 498A &harr; BNS Section 85/86 (`APPROXIMATE EQUIVALENCE`)
  - Features Section 531 BNSS savings clause warnings and High Court practice guidelines (e.g. *Abdul Khader vs State of Karnataka*, 2024:KHC:28972).
- **Global Legal Search Engine**:
  - Intelligent multi-field search parsing queries like:
    - `"IPC Section 420 cheating Supreme Court"`
    - `"Section 438 CrPC anticipatory bail Karnataka High Court"`
    - `"Section 138 NI Act cheque dishonour"`
    - `"Karnataka High Court delay in filing appeal"`
    - Citations: `"(2014) 8 SCC 273"`, `"2014 INSC 493"`, `"ILR 2021 KAR 3450"`
- **Advocate's Case Brief (19 Structured Fields)**:
  1. Case title
  2. Court and bench
  3. Date of judgment
  4. Citation and case number
  5. Facts of the case
  6. Main legal issues
  7. Arguments of the parties
  8. Relevant Acts and sections
  9. Questions considered by the court
  10. Court's reasoning
  11. Final decision or outcome
  12. Legal principles established or applied
  13. Ratio decidendi
  14. Obiter dicta
  15. Earlier judgments considered
  16. Cases followed, distinguished, or overruled
  17. Practical relevance for advocates
  18. Important paragraph references (direct jump to `[¶ 5]`, `[¶ 7]`, etc.)
  19. Limitations or uncertainty in summary
- **Advocate Practice Tools**:
  - Private Case Research Folders with client matter tags and CSV export
  - Paragraph-linked private notes (isolated per advocate account)
  - Bookmarked judgments
  - Side-by-side comparison of two judgments
  - One-click standard Indian citation copying
  - Print-friendly layout (`@media print`)

---

## 2. Quick Start & Setup Instructions

### Prerequisites
- Node.js version 18+ or 20+ (Node.js v24.19.0 verified)
- npm version 9+

### Step 1: Clone and Install Dependencies
```bash
cd d:\court
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configuration variables in `.env`:
```env
DATABASE_URL="file:./dev.db"
PORT=3000
HOSTNAME="0.0.0.0"
JWT_SECRET="advocate_legal_research_secret_key_development_2026"
LLM_API_PROVIDER="mock"
LLM_API_KEY=""
LLM_MODEL="gemini-1.5-pro"
```

### Step 3: Database Initialization & Seeding
Push the database schema and populate verified landmark records:
```bash
npm run db:push
npm run db:seed
```

This seeds verified landmark authorities across the Supreme Court of India and High Court of Karnataka (Principal Bengaluru, Dharwad, and Kalaburagi benches).

### Step 4: Start Development Server
```bash
npm run dev
```
The server binds to `0.0.0.0:3000`. You can access the interface on your desktop at:
`http://localhost:3000`
and on your smartphone/tablet over the same local Wi-Fi network at:
`http://<YOUR_LOCAL_IP>:3000`

---

## 3. Database Architecture & PostgreSQL Deployment

The application supports both:
1. **Zero-Configuration Local Mode**: Built-in SQLite via Prisma (`prisma/schema.prisma`). Ready instantly without external service dependencies.
2. **Production PostgreSQL Mode**: High-concurrency PostgreSQL schema (`prisma/schema.postgres.prisma`).

### Running with Docker PostgreSQL:
```bash
# 1. Start PostgreSQL 16 container
docker compose up -d

# 2. Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/advocate_court_db?schema=public"

# 3. Push schema & seed
npm run db:postgres:push
npm run db:seed
```

### Normalized Models:
- `User` — Advocate credentials, Bar Council registration numbers, court practice
- `Court` — Supreme Court and Karnataka High Court metadata and regional benches
- `Judgment` — Complete judicial pronouncements, citations, and 19-point briefs
- `JudgmentDocument` — Document records with SHA-256 checksums
- `Act` & `ActSection` — Statute chapters and sections with transitional mappings
- `JudgmentSection` — Normalized link between judgments and statutory provisions
- `Citation` — SCC, AIR, ILR Kar, INSC citations
- `JudgmentRelationship` — Precedent hierarchy (Followed, Distinguished, Overruled)
- `Bookmark` & `PersonalNote` — Advocate-private research notes and bookmarks
- `ResearchFolder` & `ResearchFolderJudgment` — Client case dossiers
- `SearchHistory` — Recent search tracking
- `IngestionJob` & `SourceConnector` — Official portal sync records
- `AuditLog` — Integrity and compliance trails

---

## 4. Default Verified Advocate Accounts

For immediate testing, default accounts are pre-seeded:

| Advocate Name | Email | Password | Role / Jurisdiction |
| :--- | :--- | :--- | :--- |
| **Advocate Rajesh Sharma** | `advocate@supremecourt.in` | `Advocate@2026` | Supreme Court & Karnataka HC (`KAR/1428/2008`) |
| **Advocate Priyamvada Rao** | `advocate.karnataka@law.in` | `Advocate@2026` | High Court of Karnataka, Bengaluru (`KAR/2891/2014`) |
| **Legal Tech Administrator** | `admin@court.in` | `Admin@2026` | Ingestion Bureau Administrator |

*(You can also use the One-Click Demo Account sign-in directly in the login dialog).*

---

## 5. Running Automated Acceptance Tests

Execute the automated test suite verifying all criteria in Section 16:
```bash
npm test
```
Outputs:
- Criterion 1 & 2: Supreme Court of India retrieval & folder classification
- Criterion 3: Karnataka High Court & Regional Benches (Bengaluru, Dharwad, Kalaburagi)
- Criterion 4: IPC Section 420 exclusive verified association
- Criterion 5: CrPC Section 438 anticipatory bail precedents (*Sibbia*, *Arnesh Kumar*, etc.)
- Criterion 6: Date range filtering (DD-MM-YYYY)
- Criterion 7: Exact citation search resolution
- Criterion 8 & 9: Original document viewing & 19-field Case Brief structure
- Criterion 10: Transitional law equivalence & Section 531 BNSS guidance
- Criterion 11 & 12: Private notes & research folders isolation between advocates
- Criterion 13: Duplicate document checksum detection (SHA-256 collision check)

---

## 6. Keyboard Shortcuts for Advocates

| Shortcut | Action |
| :---: | :--- |
| `/` | Focus global judgment search bar |
| `Esc` | Close dialogs, modals, or active reading panes |
| `D` | Return to Main Advocate Dashboard |
| `S` | Open Supreme Court of India Explorer |
| `K` | Open High Court of Karnataka Explorer |
| `A` | Open Acts & Sections Library |
| `B` | View Bookmarked Judgments |
| `F` | View Case Research Folders |
| `C` | View Judgment Comparison Tool |
| `P` | Print current judgment or dossier |
| `?` | Open keyboard shortcuts help modal |

---

## 7. Legal Sources & Verification Status

- **Supreme Court of India**: Sourced from official portal (`main.sci.gov.in`).
- **High Court of Karnataka**: Sourced from official portal (`karnatakahihecourt.kar.nic.in`) and authorized eCourts services.
- **Verification Guarantee**: Every judgment includes a SHA-256 document checksum. AI-generated summaries never modify or replace the official judicial text.
