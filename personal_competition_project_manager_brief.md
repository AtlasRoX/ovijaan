# Personal Competition & Project Management Dashboard

## Product Requirements Brief

**Product type:** Authenticated, personal productivity web application  
**Primary experience:** Desktop dashboard with a mobile-first, installable Progressive Web App (PWA)  
**Core modules:** Competitions, projects, tasks, calendar, teams, files, achievements, and analytics  
**Recommended stack:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Zustand, and Vercel

---

## 1. Product vision

Build a centralized personal workspace for managing competitions and projects throughout their entire lifecycle. A user should be able to add a hackathon, coding contest, challenge, or other competition; create and manage independent projects; connect projects to one or more competitions; and keep all related deadlines, tasks, teammates, submissions, documents, and outcomes in one place.

The application should replace scattered notes, spreadsheets, bookmarks, calendar entries, and file folders with one organized system. It should provide a clear picture of what is happening now, what needs attention next, what the user is building, and what they have achieved over time.

### Product principle

**One account, one private workspace, one source of truth for competitions and projects.**

The product is for an individual to manage their own participation and work. It is not a platform for running hackathons, accepting public registrations, or administering other competitors.

---

## 2. Goals and non-goals

### Goals

- Let users securely create an account and access their personal workspace from desktop and mobile.
- Make it quick to add and update a competition or project.
- Track a competition from discovery and application through participation, submission, results, and archival.
- Manage projects independently of competitions, while allowing a project to be linked to multiple competitions.
- Organize tasks, milestones, deadlines, teammates, links, and files in context.
- Provide a unified calendar, reminders, search, and useful dashboard summaries.
- Preserve a reliable history of participation, project work, and achievements.
- Make the application installable on supported mobile and desktop browsers as a PWA.
- Protect user data and make it possible to export and back it up.

### Non-goals

The initial product will not:

- Host or operate hackathons for organizers.
- Provide public participant registration, judge, mentor, sponsor, or volunteer portals.
- Run competition scoring or public leaderboards.
- Replace official platforms such as Devpost, Devfolio, MLH, Unstop, or contest websites.
- Automatically submit projects to external competition platforms.
- Require AI features for core workflows.

External links and manually recorded information are sufficient for the first release. Integrations can be considered later where official APIs and permissions are available.

---

## 3. Users and access model

### Primary user

An individual who participates in hackathons, coding competitions, innovation challenges, CTFs, research competitions, startup challenges, or similar events, and who also builds personal or team projects.

### Account model

- Use authentication so each user has a private account.
- Design the data model for multiple accounts, even if the first deployment is primarily used by one person.
- Every user-owned record must be associated with an owner account.
- Users must never be able to view or modify another user's private records.
- Do not add public profiles or social features in the initial release.

---

## 4. Application information architecture

Use a consistent main navigation structure. On desktop, use a collapsible sidebar. On mobile, use a compact navigation pattern with a clear way to access all sections.

### Main sections

1. **Dashboard** – overview, priorities, active competitions, projects, deadlines, and recent activity.
2. **Competitions** – all saved, planned, applied, registered, active, and completed competitions.
3. **Projects** – independent projects, ideas, development status, tasks, and deliverables.
4. **Calendar** – competition dates, registration deadlines, project milestones, and reminders.
5. **Tasks** – a unified task list across competitions and projects.
6. **Teams** – reusable teammate profiles and team groupings.
7. **Achievements** – results, rankings, awards, prizes, and certificates.
8. **Files** – documents and assets, with links back to their related records.
9. **Settings** – profile, account, preferences, notification settings, data export, and account management.

The navigation should remain understandable on narrow screens. Avoid placing every feature in the primary mobile navigation; secondary sections can live in a clearly labeled menu.

---

## 5. Dashboard requirements

The dashboard is the primary landing page after sign-in. It should answer three questions immediately:

1. What am I working on?
2. What is coming up, and what needs attention?
3. What have I achieved so far?

### Dashboard content

- Summary cards: total competitions, active competitions, projects in progress, pending tasks, upcoming deadlines, and achievements.
- **Upcoming deadlines:** the nearest registration, submission, presentation, and project milestone dates.
- **Active competitions:** competitions currently in application, preparation, participation, or submission stages.
- **Active projects:** projects currently being planned or developed, with visible progress and next actions.
- **Recent activity:** recently added or updated competitions, projects, tasks, submissions, and results.
- **Quick actions:** Add Competition, Add Project, Add Task, and Add Teammate.
- **Attention needed:** overdue tasks, approaching deadlines, incomplete submissions, and records missing important information.
- **Achievement summary:** finalist appearances, wins, awards, and prize totals where recorded.

### Dashboard behavior

- Cards and summaries should link to the relevant filtered list or record.
- Allow users to dismiss or complete actionable reminders without losing the underlying record.
- Use clear empty states that explain how to add the first competition or project.
- Avoid displaying meaningless zero-value charts when there is not enough data.
- Keep the dashboard configurable only where customization adds real value; do not overcomplicate the first release.

---

## 6. Competition management

A competition is any external event or challenge the user may consider, apply to, register for, participate in, or complete. Examples include hackathons, coding contests, CTFs, research challenges, innovation competitions, and startup challenges.

### 6.1 Create and edit a competition

Provide a fast add flow with essential fields first and optional details grouped into sections.

**Basic information**

- Competition name (required).
- Organizer or hosting organization.
- Competition category/type.
- Short description.
- Official website and application URL.
- External platform name, if relevant.
- Event format: online, offline, or hybrid.
- Location, venue, and time zone where applicable.
- Country or region.
- Tags.
- Personal notes.

**Dates and deadlines**

- Registration opens.
- Registration closes.
- Event start and end dates.
- Team formation deadline.
- Idea or proposal deadline.
- Final submission deadline.
- Presentation or judging date.
- Result announcement date.
- Custom dates and milestones.

Each date should support an optional time and time zone. Do not assume every competition uses every date field.

**Participation details**

- Eligibility requirements.
- Competition rules and important conditions.
- Tracks, themes, or problem statements of interest.
- Team size limits, if known.
- Registration/reference ID.
- Registration confirmation URL or notes.
- Participation fee and currency, if applicable.
- Prize pool and award categories, if known.

### 6.2 Competition lifecycle and statuses

Support a clear status field with values such as:

- Interested
- Planning to Apply
- Application in Progress
- Applied
- Registration Confirmed
- Shortlisted
- Participating
- Submission Completed
- Finalist
- Winner
- Not Selected
- Withdrawn
- Disqualified
- Completed

The product should distinguish a saved opportunity from an actual application or confirmed registration. Statuses should be editable, and important status changes should be recorded in an activity history with timestamps.

Where practical, allow users to mark a competition as archived without deleting its history.

### 6.3 Competition detail page

Each competition should have a dedicated detail page with tabs or clearly separated sections:

- Overview
- Dates and milestones
- Application and participation details
- Linked projects
- Team
- Tasks
- Submission
- Results and feedback
- Files and notes
- Activity history

The detail page should show the next deadline and current status prominently.

---

## 7. Project management

Projects are independent records. A project may exist without being associated with any competition, or it may be submitted to multiple competitions over time.

### 7.1 Create and edit a project

**Project information**

- Project name (required).
- Short tagline.
- Description.
- Problem being addressed.
- Proposed solution.
- Project category and tags.
- Project status.
- Start date and target completion date.
- Personal notes.

**Technical details**

- Technology stack.
- Languages, frameworks, libraries, and services.
- Architecture notes.
- Key features.
- Known issues and future improvements.

**Links and deliverables**

- GitHub or other source repository.
- Live deployment URL.
- Demo URL.
- Demo video URL.
- Documentation URL.
- Presentation or pitch deck.
- Design/prototype URL.
- Other useful links.

**Project assets**

- Images and screenshots.
- Documents and PDFs.
- Design files and presentations.
- Other relevant attachments.

### 7.2 Project statuses

Support at least:

- Idea
- Planned
- In Progress
- On Hold
- Completed
- Archived

Show progress using tasks or milestones rather than relying only on a manually entered percentage. If a manual progress value is supported, make clear that it is user-reported.

### 7.3 Project detail page

Each project should include:

- Overview and current status.
- Description and technical stack.
- Tasks and milestones.
- Linked competitions.
- Team members and responsibilities.
- Repository, demo, and documentation links.
- Files and project assets.
- Notes and activity history.

### 7.4 Link projects to competitions

This relationship is important and must be supported from the beginning:

- One competition can have multiple linked projects.
- One project can be linked to multiple competitions.
- Linking a project to a competition must not create a duplicate project.
- Store competition-specific submission information separately from the project itself. For example, the same project may have a different submission description, video, or version for each competition.

---

## 8. Tasks and milestones

Provide a unified task system that works across competitions and projects.

### Task fields

- Task title (required).
- Description.
- Status: To Do, In Progress, Blocked, Done, or Cancelled.
- Priority: Low, Medium, High, or Urgent.
- Due date and optional time.
- Related competition, project, or both where relevant.
- Assigned teammate, if applicable.
- Tags and notes.
- Created and updated timestamps.

### Task capabilities

- Create, edit, complete, reopen, and delete tasks.
- View all tasks together or filter by competition, project, status, priority, and due date.
- Identify overdue and upcoming tasks.
- Sort by due date, priority, or recently updated.
- Convert important competition dates into visible milestones.
- Show relevant tasks on competition and project detail pages.

Do not build a complicated enterprise project-management suite in the first release. Focus on reliable personal task tracking.

---

## 9. Calendar and reminders

The calendar should combine dates from competitions, projects, tasks, and custom reminders.

### Calendar views

- Month view.
- Week view.
- Upcoming agenda/list view.
- Filters for competitions, projects, tasks, and custom events.

### Reminder requirements

- Allow reminders to be configured for deadlines and important events.
- Support in-app reminders as the baseline.
- Add web push notifications where supported and where the user grants permission.
- Provide useful reminder timing options, such as on the day, one day before, or several days before.
- Avoid duplicate notifications for the same event and reminder configuration.
- Show the correct local date and time, while preserving the event's time zone.
- Clearly mark completed, cancelled, and overdue items.

Notifications must be optional and controllable in Settings. The app should never imply that a push notification is guaranteed when the browser or device does not support it or permission has not been granted.

---

## 10. Team and teammate management

Allow the user to maintain reusable teammate profiles and associate them with different projects and competitions.

### Teammate fields

- Name.
- Email or preferred contact information.
- Role or area of expertise.
- Skills.
- GitHub URL.
- LinkedIn URL.
- Portfolio URL.
- Notes.

### Team capabilities

- Create named team groupings.
- Add and remove teammates from a team.
- Set a team lead and record individual roles.
- Associate teams with competitions and projects.
- Reuse a teammate profile across multiple teams and events.
- View collaboration history for a teammate.

The initial release is for personal record keeping. Teammates do not need accounts or direct access to the workspace.

---

## 11. Submissions, results, and achievements

### 11.1 Competition-specific submission record

A submission belongs to a competition and may reference a project.

Store:

- Submission title.
- Submission description.
- Linked project.
- Repository URL used for the submission.
- Live demo URL.
- Demo video URL.
- Presentation or supporting document.
- Submission platform and URL.
- Submission confirmation/reference ID.
- Submitted date and time.
- Submission status: Draft, Ready, Submitted, Updated, or Withdrawn.
- Notes and relevant feedback.

Keep the competition submission record separate from general project links so each competition can have its own version and materials.

### 11.2 Results and judging records

Allow the user to manually record:

- Outcome: Participated, Not Selected, Finalist, Winner, or another custom result.
- Rank or position.
- Award category.
- Prize amount and currency, if applicable.
- Judge or reviewer feedback.
- Scores, if provided by the organizer.
- Announcement URL.
- Result date.
- Personal reflection and lessons learned.

Do not assume every competition publishes rankings or scores.

### 11.3 Achievements

Provide an achievements area that aggregates recorded outcomes across competitions:

- Total participations.
- Finalist appearances.
- Wins and awards.
- Other recognitions.
- Total recorded prize value, grouped by currency rather than incorrectly combining currencies.
- Certificates and award documents.

Every achievement should link back to its source competition.

---

## 12. Files and document management

Provide centralized file storage with contextual links to competitions, projects, submissions, and achievements.

Supported files may include:

- Participation and award certificates.
- Registration confirmations.
- Project presentations and pitch decks.
- PDFs and documentation.
- Demo videos or video links.
- Screenshots and images.
- Submission receipts.
- Rules, briefs, and reference documents.

### File requirements

- Upload, preview where supported, download, and delete files.
- Store file name, type, size, upload date, and owner.
- Associate a file with one or more relevant records where appropriate.
- Use private storage by default.
- Validate file types and size limits.
- Enforce authorization when viewing or downloading files.
- Do not expose private storage files through publicly guessable URLs.

For large media, consider storing an external URL instead of uploading the full file.

---

## 13. Search, filters, and organization

Provide global search across:

- Competitions.
- Projects.
- Tasks and milestones.
- Teammates and teams.
- Submissions.
- Notes and file metadata.

Provide filters for status, category, date range, organizer, event format, tags, project status, and outcome.

Support sorting by date, deadline, status, priority, and recently updated. Tags should be reusable where practical. Saved filter views can be added after the main search and filtering experience is stable.

---

## 14. Analytics and personal history

Provide useful summaries based on data the user has actually entered.

### Competition analytics

- Competitions saved.
- Applications submitted.
- Registrations confirmed.
- Competitions participated in.
- Submissions completed.
- Finalist appearances and wins.
- Participation by year and category.

### Project analytics

- Total projects.
- Projects by status.
- Projects linked to competitions.
- Completed projects over time.
- Technologies used most frequently, based on recorded project stacks.

### Achievement analytics

- Awards and recognitions by year.
- Competition outcomes over time.
- Prize totals separated by currency.

Use transparent definitions. For example, do not count a saved competition as an application, or an application as a confirmed registration. Make it possible to open a statistic and inspect the records behind it.

---

## 15. Authentication, privacy, and security

Use Supabase Auth for account management.

### Authentication features

- Sign up and sign in.
- Email/password authentication.
- Email verification.
- Password reset.
- Sign out.
- Protected application routes.
- Persistent sessions with secure session handling.

Additional providers, such as Google sign-in, may be added if configured.

### Security requirements

- Every private database record must include an owner/user ID.
- Enable and correctly configure Supabase Row Level Security (RLS) on all user-owned tables.
- Policies must enforce that users can only access their own records.
- Protect file storage with private buckets and ownership-aware storage policies.
- Never expose Supabase service-role keys or other secrets in client-side code.
- Validate input on both client and server boundaries.
- Check authorization on every server-side operation; hiding a button is not authorization.
- Use secure environment-variable management.
- Provide account deletion and personal data export.
- Avoid collecting unnecessary personal information.

Security must be verified with tests using more than one account to confirm that records and files cannot cross account boundaries.

---

## 16. Mobile application and PWA requirements

Deliver one responsive web application that can also be installed on supported devices as a Progressive Web App. A separate native iOS or Android application is not required for the initial release.

### Installation

- Valid web app manifest.
- Application name, short name, icons, and theme colors.
- Standalone display mode.
- Installable experience on supported browsers.
- Appropriate app metadata and splash/loading experience where supported.

### Mobile UX

- Mobile-first layouts for key screens.
- Touch-friendly controls and readable typography.
- Responsive forms that are practical on small screens.
- Quick-add actions for competitions, projects, and tasks.
- Navigation that works well with one hand.
- No horizontal overflow on common mobile screen sizes.
- Useful loading, error, and offline states.

### Offline behavior

- Cache the application shell and static assets.
- Make previously loaded information available offline where safe and practical.
- Clearly distinguish locally queued changes from successfully saved server data.
- Synchronize queued changes when connectivity returns, with conflict handling where necessary.
- Do not claim that a change is saved until the server confirms it, unless it is visibly marked as pending synchronization.

### Notifications

Support in-app reminders first. Add web push notifications for supported browsers and devices with explicit user permission. Explain unsupported cases and provide an in-app fallback.

---

## 17. UX and visual design direction

The product should feel like a polished personal productivity tool: focused, calm, fast, and information-rich without looking crowded.

### Design principles

- Clear visual hierarchy and predictable navigation.
- Consistent spacing, typography, colors, and component behavior.
- Minimal visual noise and restrained use of color.
- Strong readability for dates, deadlines, statuses, and priorities.
- Fast data entry with sensible defaults and optional advanced fields.
- Useful empty states, validation messages, loading states, and error recovery.
- Accessible contrast, keyboard navigation, focus states, and labels.
- Light and dark themes.
- Responsive behavior across desktop, tablet, and mobile.

Use status colors consistently, but never rely on color alone to communicate meaning. Use text labels and icons as supporting indicators.

### Important interaction patterns

- A quick-add flow for creating competitions, projects, and tasks.
- Detailed record pages for deeper management.
- Searchable selectors when linking a project, team, or teammate.
- Confirmation or recovery options for destructive actions.
- Autosave only where data-loss behavior is clear; otherwise provide an explicit save action and confirmation.
- Helpful validation that identifies exactly what needs correction.

---

## 18. Recommended technical architecture

Use a TypeScript-first architecture with clear separation between UI, domain logic, data access, and authorization.

| Layer | Recommended technology | Responsibility |
|---|---|---|
| Web application | Next.js App Router | Routing, layouts, server rendering, and application shell |
| Language | TypeScript | Type safety across application code |
| Styling | Tailwind CSS | Responsive styling and design tokens |
| UI components | shadcn/ui | Accessible, reusable interface components |
| Database | Supabase PostgreSQL | Persistent relational data |
| Authentication | Supabase Auth | Identity, sessions, and account recovery |
| Authorization | PostgreSQL RLS | User-level data isolation |
| File storage | Supabase Storage | Private documents and project assets |
| Client state | Zustand | Small, focused client-side state where needed |
| Forms and validation | React Hook Form and Zod | Typed forms and input validation |
| Hosting | Vercel | Web application deployment |
| PWA | Web App Manifest and Service Worker | Installation and offline application shell |

### Architecture principles

- Prefer server-side data access for protected operations.
- Keep business rules out of presentation components.
- Use typed validation schemas for inputs and database boundaries.
- Avoid duplicating authoritative data in multiple tables.
- Use database constraints and transactions for important relationships.
- Keep client state limited to genuine UI state; the database remains the source of truth.
- Use migrations to version database changes.
- Add automated tests for authorization, relationships, and core user workflows.

---

## 19. Initial database model

The following is a suggested starting model. Exact columns and normalization should be finalized during implementation.

| Entity | Purpose | Important relationships |
|---|---|---|
| `profiles` | User profile and preferences | One profile per authenticated user |
| `competitions` | Hackathon, contest, or challenge records | Owned by a user |
| `competition_dates` | Multiple event dates and deadlines | Belongs to a competition |
| `projects` | Independent project records | Owned by a user |
| `competition_projects` | Links projects to competitions | Many-to-many relationship |
| `submissions` | Competition-specific submission versions and details | Belongs to a competition; may reference a project |
| `tasks` | Personal tasks and actions | May reference a competition, project, or both |
| `milestones` | Important project or competition checkpoints | References a relevant record |
| `teammates` | Reusable teammate contacts | Owned by a user |
| `teams` | Named groups of teammates | Owned by a user |
| `team_members` | Membership and roles | Links teams and teammates |
| `competition_teams` | Team participation in competitions | Links teams and competitions |
| `project_teams` | Team collaboration on projects | Links teams and projects |
| `results` | Rankings, outcomes, awards, and feedback | Belongs to a competition; may reference a submission |
| `files` | Metadata for uploaded files | Owned by a user and linked to relevant records |
| `notes` | User notes and reflections | Owned by a user; optionally linked to records |
| `activity_logs` | Important record changes and events | Owned by a user and linked to relevant records |
| `reminders` | Notification preferences for dated items | Owned by a user and linked to relevant records |

### Data integrity rules

- Use stable IDs for records.
- Store timestamps in a consistent format, preferably UTC, and retain time-zone information when it affects event scheduling.
- Store monetary amounts with an explicit currency code.
- Use foreign keys and appropriate deletion behavior.
- Prevent duplicate relationships in join tables with unique constraints.
- Add indexes for owner ID, status, due date, and frequently filtered fields.
- Use soft deletion only where recovery or historical integrity requires it; do not make every table unnecessarily complicated.
- Ensure all user-owned records are protected by RLS.

---

## 20. Reliability, backup, and data portability

- Provide CSV export for useful tabular records such as competitions, projects, and tasks.
- Provide JSON export for a structured backup of the user's records and relationships.
- Include file metadata and, where feasible, a clear way to download stored files separately.
- Provide a documented restore or import strategy before claiming that an export is a complete restorable backup.
- Handle upload failures, network failures, and expired sessions without silently losing user data.
- Show clear save/sync states.
- Log important failures without storing secrets or unnecessary personal data.

---

## 21. MVP scope

Build the product in stages. The MVP should be useful on its own and should not be delayed by optional analytics or advanced integrations.

### MVP – required

1. Authentication and protected user workspace.
2. Main dashboard with summary cards and upcoming deadlines.
3. Create, view, edit, archive, and delete competitions.
4. Competition lifecycle/status tracking.
5. Create, view, edit, archive, and delete independent projects.
6. Link one project to multiple competitions and multiple projects to one competition.
7. Competition-specific submission details.
8. Basic tasks with due dates, priorities, and completion states.
9. Upcoming deadlines and a simple calendar/agenda view.
10. Basic teammate records and team associations.
11. Results, rankings, awards, and certificate/file attachments.
12. Responsive layouts and installable PWA foundation.
13. Global search or well-organized search within the main sections.
14. RLS, private file storage, and basic data export.

### Phase 2 – enhancements

- Advanced calendar views and configurable reminders.
- Web push notifications where supported.
- More complete file vault and document previews.
- Rich project milestones and task filtering.
- Detailed performance analytics.
- Activity timeline and change history.
- Better offline read access and queued changes.
- Import from CSV/JSON.
- Saved filters and custom tags.

### Phase 3 – optional extensions

- Official integrations with competition platforms, if APIs and terms permit.
- Email parsing or forwarding workflows for registration confirmations and deadlines.
- Calendar export or external calendar synchronization.
- Public portfolio generation from selected projects and achievements.
- Advanced reports and year-by-year reviews.
- AI-assisted extraction of event details from a supplied URL or document, always with user review before saving.

These extensions must not be prerequisites for the core product to work.

---

## 22. Core user workflows

### Workflow A: Add a competition

1. User selects **Add Competition**.
2. User enters the name and, optionally, the organizer and official URL.
3. User adds relevant registration, event, and submission dates.
4. User sets the current participation status.
5. User saves the record.
6. The competition appears in the competition list and relevant dashboard summaries.
7. Its dates appear in the calendar and upcoming-deadlines area.

### Workflow B: Add a project

1. User selects **Add Project**.
2. User enters a name, description, status, and optional technology stack.
3. User adds repository, demo, and documentation links when available.
4. User creates initial tasks or milestones.
5. User saves the project.
6. The project appears in the project list and dashboard.

### Workflow C: Connect a project to a competition

1. User opens a competition or project.
2. User selects **Link Project** or **Link Competition**.
3. User selects an existing record or creates a new one.
4. The relationship is saved without duplicating either record.
5. The competition page shows the linked project, and the project page shows the competition.
6. A separate submission record can be created for that competition.

### Workflow D: Record a submission and result

1. User opens the relevant competition.
2. User creates or updates its submission record.
3. User adds the project, repository, demo, presentation, and submission confirmation details.
4. User marks the submission as submitted and records the date.
5. When results are announced, user records the outcome, ranking, award, feedback, and certificate.
6. The competition history and achievement summaries update from the saved record.

### Workflow E: Review the week

1. User opens the dashboard or calendar.
2. User reviews upcoming deadlines and overdue tasks.
3. User opens a competition or project to complete the next action.
4. User marks tasks complete or updates dates and statuses.
5. The dashboard reflects the updated information.

---

## 23. Acceptance criteria

The initial release is ready for use when all of the following are true:

### Authentication and privacy

- A user can register, verify an email where enabled, sign in, sign out, and reset a password.
- Protected routes redirect unauthenticated users appropriately.
- Two separate test accounts cannot read, update, or delete each other's records.
- Private files cannot be accessed by another account.

### Competitions and projects

- A user can create, view, update, archive, and delete a competition.
- A user can create, view, update, archive, and delete a project.
- Statuses and important dates persist correctly after refreshing or signing in again.
- A project can be linked to multiple competitions without duplication.
- A competition can have multiple linked projects.
- Competition-specific submission details remain separate for each competition.

### Tasks and deadlines

- A user can create, update, complete, reopen, and delete tasks.
- Upcoming and overdue tasks are displayed accurately.
- Competition dates and task due dates are represented correctly in the calendar or agenda.
- Date/time-zone handling does not silently shift a deadline to the wrong local date.

### Results and files

- A user can record outcomes, ranks, awards, prizes, and feedback.
- A user can attach a certificate or other file to the correct record.
- Files can be viewed or downloaded only by authorized users.

### Mobile and PWA

- The application works at common mobile, tablet, and desktop widths.
- The PWA can be installed on supported browsers and devices.
- The installed app opens in its app-like display mode where supported.
- Core screens remain usable on a small touchscreen.
- Offline states are clear and do not falsely report unsaved changes as saved.

### Data portability

- A user can export their personal data in supported formats.
- Exported records preserve the important relationships and dates.

---

## 24. Recommended build order

1. Finalize the database schema, authentication, RLS policies, and application shell.
2. Build competition CRUD and its detail page.
3. Build project CRUD and project detail pages.
4. Implement the many-to-many competition/project relationship and competition-specific submissions.
5. Build tasks, milestones, and the upcoming-deadlines dashboard.
6. Add teams, teammates, results, achievements, and file storage.
7. Add calendar, search, and basic analytics.
8. Complete mobile polish and PWA installation support.
9. Add export, backups, automated tests, and production hardening.

Do not start by building charts or decorative dashboard widgets. The data model and core create/update workflows must be correct first.

---

## 25. Final product definition

The finished product is a private, authenticated, installable personal workspace for managing competitions and projects.

A user can add a competition, track its application and participation status, manage dates and tasks, connect teammates, link one or more projects, maintain competition-specific submissions, record results, and store certificates. The user can also create projects independently, manage their development, and reuse them across competitions.

The dashboard brings all of this together into one clear view of current work, upcoming deadlines, and accumulated achievements.

**The product succeeds when a user no longer needs separate spreadsheets, notes, and scattered folders to understand or manage their entire competition and project journey.**
