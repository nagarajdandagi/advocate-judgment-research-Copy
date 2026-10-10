-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "barRegistrationNo" TEXT,
    "courtPractice" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADVOCATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "state" TEXT,
    "hierarchyLevel" INTEGER NOT NULL DEFAULT 1,
    "benches" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Judgment" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "benchName" TEXT NOT NULL,
    "benchType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "petitioner" TEXT,
    "respondent" TEXT,
    "caseType" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "caseYear" INTEGER,
    "judgmentDate" TIMESTAMP(3) NOT NULL,
    "disposalNature" TEXT,
    "authorJudge" TEXT,
    "coram" TEXT,
    "neutralCitation" TEXT,
    "reportedCitation" TEXT,
    "legalTopics" TEXT,
    "folderCategories" TEXT,
    "headnote" TEXT,
    "fullText" TEXT NOT NULL,
    "paragraphCount" INTEGER NOT NULL DEFAULT 1,
    "sourceUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "documentChecksum" TEXT,
    "isOverruled" BOOLEAN NOT NULL DEFAULT false,
    "precedentialStatus" TEXT NOT NULL DEFAULT 'BINDING_PRECEDENT',
    "practicalNotes" TEXT,
    "briefFacts" TEXT,
    "briefIssues" TEXT,
    "briefArguments" TEXT,
    "briefQuestions" TEXT,
    "briefReasoning" TEXT,
    "briefOutcome" TEXT,
    "briefRatioDecidendi" TEXT,
    "briefObiterDicta" TEXT,
    "briefEarlierCases" TEXT,
    "briefFollowedOverruled" TEXT,
    "briefAdvocateRelevance" TEXT,
    "briefImportantParas" TEXT,
    "briefLimitations" TEXT,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Judgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgmentDocument" (
    "id" TEXT NOT NULL,
    "judgmentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL DEFAULT 'application/pdf',
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "fileUrl" TEXT,
    "rawText" TEXT,
    "ocrPerformed" BOOLEAN NOT NULL DEFAULT false,
    "ocrConfidence" DOUBLE PRECISION,
    "extractionStatus" TEXT NOT NULL DEFAULT 'COMPLETED',
    "checksumSha256" TEXT NOT NULL,
    "isOriginal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JudgmentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Act" (
    "id" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "isHistorical" BOOLEAN NOT NULL DEFAULT false,
    "effectiveDate" TIMESTAMP(3),
    "repealedOn" TIMESTAMP(3),
    "transitionalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Act_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActSection" (
    "id" TEXT NOT NULL,
    "actId" TEXT NOT NULL,
    "chapterNumber" TEXT,
    "chapterTitle" TEXT,
    "sectionNumber" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "contentSummary" TEXT,
    "correspondingActName" TEXT,
    "correspondingSection" TEXT,
    "equivalenceType" TEXT NOT NULL DEFAULT 'VERIFIED',
    "transitionalGuidance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgmentSection" (
    "id" TEXT NOT NULL,
    "judgmentId" TEXT NOT NULL,
    "actSectionId" TEXT NOT NULL,
    "rawSectionReference" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JudgmentSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "judgmentId" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "volume" INTEGER,
    "pageNumber" TEXT,
    "fullCitationText" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgmentRelationship" (
    "id" TEXT NOT NULL,
    "sourceJudgmentId" TEXT NOT NULL,
    "targetJudgmentId" TEXT,
    "targetCitationText" TEXT,
    "relationshipType" TEXT NOT NULL,
    "treatmentNotes" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JudgmentRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "judgmentId" TEXT NOT NULL,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchFolder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "clientReference" TEXT,
    "caseReference" TEXT,
    "color" TEXT NOT NULL DEFAULT 'slate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchFolderJudgment" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "judgmentId" TEXT NOT NULL,
    "userNotes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchFolderJudgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "judgmentId" TEXT NOT NULL,
    "paragraphIndex" INTEGER,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "queryText" TEXT NOT NULL,
    "filtersJson" TEXT,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionJob" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalFound" INTEGER NOT NULL DEFAULT 0,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "detailsJson" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceConnector" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "connectorName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "authType" TEXT NOT NULL DEFAULT 'PUBLIC_PORTAL',
    "lastSyncAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ONLINE',
    "rateLimitNotes" TEXT,
    "robotsVerified" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceConnector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "detailsJson" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Court_code_key" ON "Court"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Judgment_neutralCitation_key" ON "Judgment"("neutralCitation");

-- CreateIndex
CREATE INDEX "Judgment_courtId_idx" ON "Judgment"("courtId");

-- CreateIndex
CREATE INDEX "Judgment_judgmentDate_idx" ON "Judgment"("judgmentDate");

-- CreateIndex
CREATE INDEX "Judgment_caseType_idx" ON "Judgment"("caseType");

-- CreateIndex
CREATE INDEX "Judgment_neutralCitation_idx" ON "Judgment"("neutralCitation");

-- CreateIndex
CREATE INDEX "Judgment_reportedCitation_idx" ON "Judgment"("reportedCitation");

-- CreateIndex
CREATE INDEX "Judgment_verificationStatus_idx" ON "Judgment"("verificationStatus");

-- CreateIndex
CREATE INDEX "JudgmentDocument_judgmentId_idx" ON "JudgmentDocument"("judgmentId");

-- CreateIndex
CREATE INDEX "JudgmentDocument_checksumSha256_idx" ON "JudgmentDocument"("checksumSha256");

-- CreateIndex
CREATE UNIQUE INDEX "Act_shortName_key" ON "Act"("shortName");

-- CreateIndex
CREATE INDEX "ActSection_actId_idx" ON "ActSection"("actId");

-- CreateIndex
CREATE INDEX "ActSection_sectionNumber_idx" ON "ActSection"("sectionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ActSection_actId_sectionNumber_key" ON "ActSection"("actId", "sectionNumber");

-- CreateIndex
CREATE INDEX "JudgmentSection_judgmentId_idx" ON "JudgmentSection"("judgmentId");

-- CreateIndex
CREATE INDEX "JudgmentSection_actSectionId_idx" ON "JudgmentSection"("actSectionId");

-- CreateIndex
CREATE UNIQUE INDEX "JudgmentSection_judgmentId_actSectionId_key" ON "JudgmentSection"("judgmentId", "actSectionId");

-- CreateIndex
CREATE INDEX "Citation_judgmentId_idx" ON "Citation"("judgmentId");

-- CreateIndex
CREATE INDEX "Citation_fullCitationText_idx" ON "Citation"("fullCitationText");

-- CreateIndex
CREATE INDEX "JudgmentRelationship_sourceJudgmentId_idx" ON "JudgmentRelationship"("sourceJudgmentId");

-- CreateIndex
CREATE INDEX "JudgmentRelationship_targetJudgmentId_idx" ON "JudgmentRelationship"("targetJudgmentId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_judgmentId_idx" ON "Bookmark"("judgmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_judgmentId_key" ON "Bookmark"("userId", "judgmentId");

-- CreateIndex
CREATE INDEX "ResearchFolder_userId_idx" ON "ResearchFolder"("userId");

-- CreateIndex
CREATE INDEX "ResearchFolderJudgment_folderId_idx" ON "ResearchFolderJudgment"("folderId");

-- CreateIndex
CREATE INDEX "ResearchFolderJudgment_judgmentId_idx" ON "ResearchFolderJudgment"("judgmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchFolderJudgment_folderId_judgmentId_key" ON "ResearchFolderJudgment"("folderId", "judgmentId");

-- CreateIndex
CREATE INDEX "PersonalNote_userId_idx" ON "PersonalNote"("userId");

-- CreateIndex
CREATE INDEX "PersonalNote_judgmentId_idx" ON "PersonalNote"("judgmentId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_searchedAt_idx" ON "SearchHistory"("searchedAt");

-- CreateIndex
CREATE INDEX "IngestionJob_status_idx" ON "IngestionJob"("status");

-- CreateIndex
CREATE INDEX "SourceConnector_courtId_idx" ON "SourceConnector"("courtId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Judgment" ADD CONSTRAINT "Judgment_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgmentDocument" ADD CONSTRAINT "JudgmentDocument_judgmentId_fkey" FOREIGN KEY ("judgmentId") REFERENCES "Judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActSection" ADD CONSTRAINT "ActSection_actId_fkey" FOREIGN KEY ("actId") REFERENCES "Act"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgmentSection" ADD CONSTRAINT "JudgmentSection_judgmentId_fkey" FOREIGN KEY ("judgmentId") REFERENCES "Judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgmentSection" ADD CONSTRAINT "JudgmentSection_actSectionId_fkey" FOREIGN KEY ("actSectionId") REFERENCES "ActSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_judgmentId_fkey" FOREIGN KEY ("judgmentId") REFERENCES "Judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgmentRelationship" ADD CONSTRAINT "JudgmentRelationship_sourceJudgmentId_fkey" FOREIGN KEY ("sourceJudgmentId") REFERENCES "Judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgmentRelationship" ADD CONSTRAINT "JudgmentRelationship_targetJudgmentId_fkey" FOREIGN KEY ("targetJudgmentId") REFERENCES "Judgment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_judgmentId_fkey" FOREIGN KEY ("judgmentId") REFERENCES "Judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchFolder" ADD CONSTRAINT "ResearchFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchFolderJudgment" ADD CONSTRAINT "ResearchFolderJudgment_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ResearchFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchFolderJudgment" ADD CONSTRAINT "ResearchFolderJudgment_judgmentId_fkey" FOREIGN KEY ("judgmentId") REFERENCES "Judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalNote" ADD CONSTRAINT "PersonalNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalNote" ADD CONSTRAINT "PersonalNote_judgmentId_fkey" FOREIGN KEY ("judgmentId") REFERENCES "Judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceConnector" ADD CONSTRAINT "SourceConnector_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

