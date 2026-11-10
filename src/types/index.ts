export type CompetitionStatus =
  | 'Interested'
  | 'Planning to Apply'
  | 'Application in Progress'
  | 'Applied'
  | 'Registration Confirmed'
  | 'Shortlisted'
  | 'Participating'
  | 'Submission Completed'
  | 'Finalist'
  | 'Winner'
  | 'Not Selected'
  | 'Withdrawn'
  | 'Disqualified'
  | 'Completed';

export type EventFormat = 'online' | 'offline' | 'hybrid';

export interface CustomMilestone {
  id: string;
  label: string;
  date: string;
  completed: boolean;
}

export interface CompetitionDates {
  registrationOpens?: string;
  registrationCloses?: string;
  eventStarts?: string;
  eventEnds?: string;
  teamFormationDeadline?: string;
  ideaDeadline?: string;
  submissionDeadline?: string;
  presentationDate?: string;
  resultDate?: string;
  customMilestones?: CustomMilestone[];
}

export interface CompetitionParticipation {
  eligibility?: string;
  rules?: string;
  tracks?: string[];
  teamSizeMin?: number;
  teamSizeMax?: number;
  registrationId?: string;
  confirmationUrl?: string;
  fee?: number;
  currency?: string;
  prizePool?: string;
}

export interface Competition {
  id: string;
  userId: string;
  name: string;
  organizer?: string;
  category?: string;
  shortDescription?: string;
  websiteUrl?: string;
  applicationUrl?: string;
  platform?: string;
  format: EventFormat;
  location?: string;
  timeZone?: string;
  country?: string;
  tags: string[];
  personalNotes?: string;
  status: CompetitionStatus;
  archived?: boolean;
  dates: CompetitionDates;
  participation: CompetitionParticipation;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | 'Idea'
  | 'Planned'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Archived';

export interface ProjectLinks {
  repoUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  docsUrl?: string;
  deckUrl?: string;
  designUrl?: string;
  otherLinks?: { label: string; url: string }[];
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  tagline?: string;
  description?: string;
  problemStatement?: string;
  proposedSolution?: string;
  category?: string;
  tags: string[];
  status: ProjectStatus;
  startDate?: string;
  targetDate?: string;
  personalNotes?: string;
  techStack: string[];
  architectureNotes?: string;
  keyFeatures?: string[];
  knownIssues?: string;
  links: ProjectLinks;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionProjectLink {
  id: string;
  userId: string;
  competitionId: string;
  projectId: string;
  linkedAt: string;
}

export type SubmissionStatus =
  | 'Draft'
  | 'Ready'
  | 'Submitted'
  | 'Updated'
  | 'Withdrawn';

export interface Submission {
  id: string;
  userId: string;
  competitionId: string;
  projectId?: string;
  title: string;
  description?: string;
  repoUrl?: string;
  liveUrl?: string;
  demoVideoUrl?: string;
  deckUrl?: string;
  platform?: string;
  platformUrl?: string;
  confirmationId?: string;
  submittedAt?: string;
  status: SubmissionStatus;
  notes?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Done' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  competitionId?: string;
  projectId?: string;
  assignedTeammateId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Teammate {
  id: string;
  userId: string;
  name: string;
  email?: string;
  role?: string;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  userId: string;
  name: string;
  description?: string;
  leadTeammateId?: string;
  memberIds: string[];
  createdAt: string;
}

export type ResultOutcome =
  | 'Winner'
  | 'Finalist'
  | 'Participated'
  | 'Not Selected'
  | 'Special Award'
  | 'Other';

export interface Result {
  id: string;
  userId: string;
  competitionId: string;
  submissionId?: string;
  outcome: ResultOutcome;
  rank?: string;
  awardCategory?: string;
  prizeAmount?: number;
  prizeCurrency?: string;
  scores?: string;
  feedback?: string;
  announcementUrl?: string;
  resultDate?: string;
  reflections?: string;
  certificateUrl?: string;
  certificateName?: string;
  createdAt: string;
}

export type FileCategory =
  | 'Certificate'
  | 'Deck'
  | 'Registration'
  | 'Doc'
  | 'Media'
  | 'Other';

export interface AppFile {
  id: string;
  userId: string;
  name: string;
  size: number;
  type: string;
  url: string;
  downloadUrl?: string;
  relatedCompetitionId?: string;
  relatedProjectId?: string;
  relatedSubmissionId?: string;
  relatedResultId?: string;
  category: FileCategory;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  entityType: 'competition' | 'project' | 'task' | 'submission' | 'result' | 'file';
  entityId: string;
  action: string;
  description: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  bio?: string;
  preferredCurrency?: string;
}
