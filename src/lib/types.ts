export interface Court {
  id: string;
  code: string;
  name: string;
  jurisdiction: string;
  state: string | null;
  hierarchyLevel: number;
  websiteUrl: string;
  benches: string[];
  totalJudgments?: number;
  categories?: Array<{
    id: string;
    name: string;
    count: number;
    filterType: string;
    filterValue: string;
  }>;
}

export interface ActSection {
  id: string;
  sectionNumber: string;
  sectionTitle: string;
  contentSummary?: string | null;
  correspondingActName?: string | null;
  correspondingSection?: string | null;
  equivalenceType: string; // "VERIFIED", "APPROXIMATE", "UNAVAILABLE"
  transitionalGuidance?: string | null;
  totalJudgments?: number;
  scCount?: number;
  karCount?: number;
}

export interface ActChapter {
  chapterNumber: string;
  chapterTitle: string;
  sections: ActSection[];
}

export interface Act {
  id: string;
  shortName: string;
  officialName: string;
  year: number;
  category: string;
  isHistorical: boolean;
  transitionalNote?: string | null;
  effectiveDate?: string | null;
  repealedOn?: string | null;
  totalJudgments: number;
  totalSections: number;
  chapters: ActChapter[];
}

export interface JudgmentSummary {
  id: string;
  title: string;
  court: {
    code: string;
    name: string;
  };
  benchName: string;
  benchType: string;
  caseType: string;
  caseNumber: string;
  judgmentDate: string;
  formattedDate: string;
  neutralCitation?: string | null;
  reportedCitation?: string | null;
  disposalNature?: string | null;
  authorJudge?: string | null;
  coram?: string | null;
  headnote?: string | null;
  verificationStatus: string;
  precedentialStatus: string;
  isOverruled: boolean;
  sections?: Array<{
    actShortName: string;
    sectionNumber: string;
    sectionTitle: string;
    equivalenceType?: string;
    correspondingSection?: string | null;
  }>;
  legalTopics?: string[];
  folderCategories?: string[];
  relevanceScore?: number;
  snippetHtml?: string;
}

export interface JudgmentDetail extends JudgmentSummary {
  fullText: string;
  paragraphCount: number;
  sourceUrl?: string | null;
  documentChecksum?: string | null;
  practicalNotes?: string | null;
  citations: Array<{
    id: string;
    reporter: string;
    year: number;
    volume?: number | null;
    pageNumber?: string | null;
    fullCitationText: string;
    isPrimary: boolean;
  }>;
  documents: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileUrl?: string | null;
    extractionStatus: string;
    checksumSha256: string;
    ocrPerformed: boolean;
  }>;
  paragraphs: Array<{ index: number; text: string }>;
  outwardRelations: Array<{
    id: string;
    relationshipType: string;
    treatmentNotes?: string | null;
    targetCitationText?: string | null;
    targetJudgment?: {
      id: string;
      title: string;
      neutralCitation?: string | null;
      reportedCitation?: string | null;
      court: { code: string; name: string };
    } | null;
  }>;
  inwardRelations: Array<{
    id: string;
    relationshipType: string;
    treatmentNotes?: string | null;
    sourceJudgment: {
      id: string;
      title: string;
      neutralCitation?: string | null;
      reportedCitation?: string | null;
      court: { code: string; name: string };
    };
  }>;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  barRegistrationNo?: string | null;
  courtPractice?: string | null;
}
