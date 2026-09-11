# SKILLHUB
## Project System Report

**A Career-Guided Personalized Learning Platform**

| Field | Detail |
|-------|--------|
| Document Type | Final Project System Report |
| Project Name | SkillHub |
| Project Type | Full-stack web application |
| Purpose | Document the problem, objectives, design, technologies, workflows, modules, features, and outcomes |
| Audience | Teachers, examiners, supervisors, teammates, and project reviewers |
| Style | Formal project report with both plain explanations and technical details |

# TABLE OF CONTENTS

1. Introduction
2. Problem Statement
3. Project Objectives
4. Scope of the Project
5. Technologies Used
6. System Overview
7. System Architecture
8. User Roles and Responsibilities
9. Main System Workflow
10. Module 1 - Account and Access
11. Module 2 - Career Guidance
12. Module 3 - Skills Check and Skill Profile
13. Module 4 - Personal Roadmap
14. Module 5 - Courses and Lessons
15. Module 6 - Learning Support (AI Helper and Messaging)
16. Module 7 - Progress, Certificates, and Badges
17. Module 8 - Skill Exchange
18. Module 9 - Instructor System
19. Module 10 - Admin System
20. Entity Relationship (ER) Design
21. System Flowchart
22. How All Modules Connect
23. Detailed Use Case Scenarios
24. Features Summary by Role
25. Expected Benefits
26. Testing and Validation Approach
27. Limitations and Future Improvements
28. Conclusion
29. References / Tools Summary

# 1. INTRODUCTION

## 1.1 Project Background

In today’s digital world, many students and career changers want to enter technology fields such as software development, data science, cloud computing, and related areas. Online learning platforms provide many courses, but learners still struggle with important questions:

- Which career should I choose?  
- What skills do I already have?  
- What should I learn next?  
- How can I follow a clear plan instead of random courses?  
- How can I get help when I am stuck?  
- How can I prove what I completed?

SkillHub was developed as a project to solve these problems by combining career guidance, skill assessment, personalized learning roadmaps, course learning, support tools, certificates, and peer collaboration in one system.

## 1.2 What is SkillHub?

SkillHub is a **career-guided personalized learning platform**. It is a full-stack web system with:

- A **frontend** (user interface) for learners, instructors, and admins  
- A **backend** (server application) that processes business logic and security  
- A **database** that stores users, careers, skills, courses, progress, certificates, and related data  

SkillHub does more than list courses. It connects:

- Career goals  
- Required skills  
- Learner skill levels  
- Personal roadmaps  
- Courses and lessons  
- Help tools (AI assistant and instructor chat)  
- Certificates and badges  
- Peer practice through Skill Exchange  

## 1.3 Guiding Idea of the System

The system is designed around one clear idea:

> Careers need skills.  
> Learning builds skills.  
> Progress unlocks the next step.

This means every major feature supports a continuous growth cycle rather than disconnected course browsing.

## 1.4 Importance of the Project

This project is important because it shows how a practical learning platform can:

1. Guide undecided learners toward suitable careers.  
2. Measure current ability before recommending content.  
3. Build personal learning plans based on skill gaps.  
4. Support instructors in creating and managing courses.  
5. Allow admins to control quality and platform structure.  
6. Combine learning, messaging, AI support, and recognition in one product.

For academic and project evaluation, SkillHub also demonstrates real full-stack development skills: frontend design, backend APIs, database persistence, authentication, role-based access, and feature integration.

# 2. PROBLEM STATEMENT

## 2.1 Existing Problems in Online Learning

Traditional online learning platforms often have these weaknesses:

1. **No clear career starting point**  
   Learners browse courses randomly without knowing which career they are aiming for.

2. **No reliable skill measurement**  
   Learners do not know their real skill level for a target career.

3. **No personal gap analysis**  
   Learners do not clearly see which skills are missing.

4. **Generic learning paths**  
   Most platforms recommend the same path to everyone, even when skill levels differ.

5. **Weak support while studying**  
   When learners get stuck, they often have little immediate help.

6. **Weak proof of completion**  
   Progress may not produce clear certificates or achievement records.

7. **Limited peer practice**  
   Learning is often lonely, with little teamwork or project collaboration.

8. **Unclear content quality control**  
   Instructor content may be published without a strong approval process.

## 2.2 Consequences of These Problems

Because of the problems above, learners may:

- Waste time on unrelated courses  
- Skip important foundations  
- Feel confused and demotivated  
- Fail to finish learning paths  
- Have no clear proof of achievement  

## 2.3 How SkillHub Solves the Problem

SkillHub solves these issues by guiding each learner through a structured journey:

**Career choice  to  Skills check  to  Skill gaps  to  Personal roadmap  to  Courses and lessons  to  Help and support  to  Completion  to  Certificates  to  Next step**

At the same time, instructors create teaching content, and admins maintain careers, skills, questions, and quality control. This creates a complete learning ecosystem rather than a simple course catalog.

# 3. PROJECT OBJECTIVES

## 3.1 General Objective

To design and develop a full-stack career-guided learning platform that helps users discover or select a career, assess skills, generate a personal roadmap, learn through courses, receive support, earn certificates, and collaborate with peers.

## 3.2 Specific Objectives

1. Develop a secure registration and login system for Learners, Instructors, and Admins.  
2. Implement career discovery for undecided users and career browsing for decided users.  
3. Implement a skills check that estimates learner skill levels for a selected career.  
4. Automatically identify skill gaps between career requirements and learner ability.  
5. Generate a personalized roadmap of recommended courses.  
6. Provide course enrollment, lesson learning, progress tracking, and course completion.  
7. Provide an AI study helper for lesson support.  
8. Provide instructor–learner messaging with notifications.  
9. Issue certificates and badges after eligible course completion.  
10. Provide Skill Exchange for collaborative learning projects.  
11. Allow instructors to create, edit, and submit courses for approval.  
12. Allow admins to manage users, careers, skills, questions, courses, reviews, and projects.  
13. Use modern web technologies to build a maintainable frontend and backend system.

## 3.3 Learning Outcomes Demonstrated by This Project

This project demonstrates the ability to:

- Analyze a real learning problem and design a solution  
- Separate system roles and permissions clearly  
- Design end-to-end user workflows  
- Implement frontend and backend integration  
- Store and manage structured application data  
- Combine multiple modules into one coherent product  

# 4. SCOPE OF THE PROJECT

## 4.1 In Scope

The project includes:

### Functional Scope
- User registration and authentication  
- Role-based access for Learner, Instructor, and Admin  
- Career discovery and career selection  
- Skills assessment and skill profile creation  
- Personalized roadmap generation  
- Course catalog, enrollment, and lessons  
- Course completion, ratings, and reviews  
- AI lesson assistant  
- Chat messaging and unread notifications  
- Certificates and badges  
- Skill Exchange project collaboration  
- Instructor course authoring and submission  
- Admin content and platform management  
- Initial seeded careers, skills, questions, and courses  

### Technical Scope
- React-based frontend web application  
- Spring Boot backend REST API  
- PostgreSQL database  
- JWT-based authentication and optional Google login  
- Role-based route and API protection  

## 4.2 Out of Scope

The following are outside the main current scope or only partially covered:

- Native mobile applications (iOS/Android apps)  
- Fully advanced proctored examination systems  
- Heavy payment/subscription billing  
- Very advanced recommendation AI beyond current assessment/roadmap logic  
- Large-scale multi-tenant enterprise deployment documentation  

## 4.3 Assumptions

- Users have internet access and a modern web browser.  
- Admins will maintain careers, skills, and questions.  
- Instructors will create meaningful course content.  
- Learners will complete skills checks honestly for better roadmap quality.

# 5. TECHNOLOGIES USED

This section explains the main technologies used to build SkillHub and why they were chosen.

## 5.1 Technology Stack Overview

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React.js | Build interactive user interface pages |
| Frontend build tool | Vite | Fast development server and production build |
| Frontend routing | React Router DOM | Page navigation and protected routes |
| Frontend HTTP client | Axios | Call backend APIs |
| Frontend UI helpers | Lucide icons, Framer Motion | Icons and smooth interface motion |
| Backend | Spring Boot (Java) | Business logic, APIs, security |
| Backend security | Spring Security + JWT | Login protection and role control |
| Backend OAuth | Spring OAuth2 Client | Optional Google sign-in |
| Backend data access | Spring Data JPA / Hibernate | Save and read database records |
| Database | PostgreSQL | Store users, careers, courses, progress, etc. |
| AI support | Google Gemini API | Lesson study helper responses |
| Project build (backend) | Maven / Maven Wrapper | Dependency management and running backend |
| Language (backend) | Java 21 | Backend programming language |
| Language (frontend) | JavaScript (React) | Frontend programming language |

## 5.2 Frontend Technologies (Detailed)

### React.js
React is used to create reusable interface components such as navigation bars, dashboards, forms, lesson pages, and chat panels. It helps keep the user interface organized and interactive.

### Vite
Vite is used as the frontend development and build tool. It provides fast startup during development and packages the frontend for use.

### React Router DOM
React Router manages page paths such as dashboard, career pages, courses, roadmap, admin pages, and instructor pages. It also supports protected pages based on login and role.

### Axios
Axios is used to send requests from the frontend to the backend (for example login, load courses, submit assessment, generate roadmap, send messages).

### Supporting Frontend Libraries
- **Lucide React** for clean icons  
- **Framer Motion** for simple animations and better visual experience  

## 5.3 Backend Technologies (Detailed)

### Spring Boot
Spring Boot is the main backend framework. It provides REST APIs that the frontend calls. Examples of backend responsibilities:

- Register and login users  
- Calculate career matches  
- Grade skills checks  
- Generate roadmaps  
- Manage enrollments and certificates  
- Handle chat messages  
- Support admin and instructor operations  

### Spring Security and JWT
Spring Security protects private APIs. After login, the system issues a secure token (JWT) stored in an HTTP-only cookie. This helps keep sessions secure and supports role-based access for Learner, Instructor, and Admin.

### Spring OAuth2 Client
This allows optional Google account login in addition to email/password login.

### Spring Data JPA and Hibernate
These tools map Java objects to database tables and simplify create/read/update/delete operations for users, careers, courses, lessons, enrollments, and more.

### Validation and JSON Processing
- Validation annotations help check incoming data  
- Jackson helps convert data between JSON and Java objects  

### Lombok
Lombok reduces repetitive backend code and keeps entity/service classes cleaner.

## 5.4 Database Technology

### PostgreSQL
PostgreSQL is used as the main relational database. It stores:

- User accounts and roles  
- Skills and careers  
- Career-skill requirements  
- Discovery and assessment questions  
- Courses, lessons, and reviews  
- Enrollments and lesson progress  
- Roadmap items  
- Certificates and badges  
- Chat messages  
- Skill Exchange projects and requests  

In this project setup, PostgreSQL can be hosted through a cloud Postgres provider (for example Supabase-hosted PostgreSQL), while the application still uses standard database connection settings.

## 5.5 AI Technology

### Google Gemini
The AI study helper uses Google Gemini to answer learner questions about the current lesson. The backend sends lesson context and the learner’s question, then returns a helpful explanation, example, summary, or hint.

If the AI key is unavailable, the system can fall back to a basic local response so learning support does not fully break.

## 5.6 Development and Project Tools

| Tool | Use in project |
|------|----------------|
| Visual Studio Code / Cursor | Writing and editing code |
| Node.js + npm | Frontend package installation and scripts |
| Maven Wrapper (`mvnw`) | Running and building Spring Boot backend |
| Git / GitHub | Version control and project sharing |
| Browser DevTools | Frontend testing and debugging |
| `.env` configuration | Keep secrets (database password, API keys) out of source code |
| Startup scripts (`start-all.ps1` / `.bat`) | Start backend and frontend together |

## 5.7 High-Level Technical Flow

1. Browser (React Frontend)
2. HTTPS / API requests (Axios)
3. Spring Boot Backend (Java)
4. Security check (JWT / roles)
5. Business Services
6. (Career, Assessment, Roadmap, Enrollment, Chat, AI, Admin...)
7. PostgreSQL Database

# 6. SYSTEM OVERVIEW

## 6.1 System Purpose

SkillHub is designed as a complete learning journey platform. Its purpose is to help a learner move from career confusion to structured skill growth.

## 6.2 Main Capabilities

SkillHub provides:

1. Career discovery and career selection  
2. Skills assessment and gap detection  
3. Personalized roadmap generation  
4. Course and lesson learning  
5. AI and instructor support  
6. Progress tracking and certificates  
7. Peer collaboration through Skill Exchange  
8. Instructor content creation  
9. Admin quality and structure control  

## 6.3 Difference From a Normal Course Website

| Normal course website | SkillHub |
|-----------------------|----------|
| Random browsing | Career goal first |
| Weak personalization | Roadmap based on skill gaps |
| Same path for everyone | Different path per learner |
| Limited support | AI helper + instructor chat |
| Weak completion proof | Certificates and badges |
| Little peer practice | Skill Exchange projects |

## 6.4 Four Core Questions Answered by SkillHub

| Question | System answer |
|----------|---------------|
| What career am I aiming for? | Career discovery or career browsing |
| What can I already do? | Skills check and skill profile |
| What should I learn next? | Personal roadmap and course recommendations |
| How do I prove I finished? | Certificates, badges, and progress records |

# 7. SYSTEM ARCHITECTURE

## 7.1 Architecture Style

SkillHub uses a **three-tier style architecture**:

1. **Presentation Layer (Frontend)** - what users see and click  
2. **Application Layer (Backend)** - business rules, security, APIs  
3. **Data Layer (Database)** - permanent storage  

## 7.2 Frontend Structure (Conceptual)

The frontend is organized by pages and shared components, including:

- Public pages (landing, login, register)  
- Learner pages (dashboard, career, assessment, roadmap, courses, lessons, certificates, chat, skill exchange)  
- Instructor pages (dashboard, course editor, messages)  
- Admin pages (users, careers, skills, questions, courses, reviews, projects, stats)  
- Shared contexts for authentication and chat notifications  

## 7.3 Backend Structure (Conceptual)

The backend is organized by feature domains, such as:

- Auth and security  
- Career and discovery  
- Assessment  
- Roadmap  
- Courses and lessons  
- Enrollment and certificates  
- Chat  
- AI tutor  
- Skill Exchange  
- Instructor services  
- Admin services  
- Data initializer for starter content  

## 7.4 Security Architecture (Simple Explanation)

1. User logs in with email/password or Google.  
2. Backend verifies identity and creates a secure session token (JWT).  
3. Token is stored in a protected browser cookie.  
4. Later requests are checked for valid login.  
5. Role checks decide whether the user can access learner, instructor, or admin features.

## 7.5 Deployment / Run Model (Project Level)

For local project use:

- Backend runs as a Spring Boot application (commonly on port 8080).  
- Frontend runs as a Vite React app (commonly on port 5173).  
- Both can be started using project startup scripts after environment values are loaded.

# 8. USER ROLES AND RESPONSIBILITIES

## 8.1 Learner (Student)

Learners are the primary users.

### Goals
- Find or confirm a career  
- Learn missing skills  
- Complete courses  
- Earn recognition  
- Practice with peers  

### Key Actions
- Register / sign in  
- Use Career hub  
- Take skills check  
- Follow roadmap  
- Enroll and study courses  
- Use AI helper and messaging  
- Track My Learning  
- View certificates  
- Join Skill Exchange  

### Main Menu Areas
Dashboard, Career, Courses, My Learning, Messages, Skill Exchange, Certificates, Profile

## 8.2 Instructor

Instructors create teaching content and support learners.

### Goals
- Publish useful courses  
- Help learners who ask questions  
- Improve content using feedback  

### Key Actions
- Create and edit courses/lessons  
- Submit courses for approval  
- Reply to learner messages  
- Monitor course stats  

### Boundaries
Instructors do not fully control careers, global skills, or platform-wide user management.

## 8.3 Admin

Admins maintain structure and quality.

### Goals
- Keep careers and skills accurate  
- Keep questions useful  
- Approve quality courses  
- Keep community content safe  

### Key Actions
- Manage users  
- Manage skills and careers  
- Manage discovery and assessment questions  
- Approve/reject courses  
- Moderate reviews and Skill Exchange projects  
- View platform stats  

## 8.4 Role Collaboration Model

1. Admin builds the structure
2. (careers, skills, questions, approvals)
3. Instructor fills the structure
4. (courses and lessons)
5. Learner walks the path
6. (career  to  skills check  to  roadmap  to  learning  to  certificates)

# 9. MAIN SYSTEM WORKFLOW

## 9.1 End-to-End Learner Flow

1. Create account / Sign in
2. Open Dashboard
3. Open Career
4. v             v
5. Find my career   I already know
6. my career
7. v             v
8. Get suggestions  Browse and select
9. Take skills check
10. Create skill profile
11. Identify skill gaps
12. Generate personal roadmap
13. Enroll in recommended courses
14. Study lessons
15. (AI helper / instructor chat)
16. Complete course
17. Rate and review
18. Earn certificate / badge
19. Roadmap updates
20. Next course unlocks

## 9.2 Side Paths Available Anytime

- Browse full course catalog  
- Change career later  
- Open Messages  
- Join Skill Exchange  
- Check Certificates / Profile  
- Continue unfinished courses from My Learning  

## 9.3 Why Order Matters

Random course browsing can still teach useful topics, but it often creates:

- Weak foundations  
- Unrelated learning  
- Slow career progress  

SkillHub’s recommended order is:

**Goal  to  Current level  to  Plan  to  Learning  to  Proof  to  Next step**

# 10. MODULE 1 - ACCOUNT AND ACCESS

## 10.1 Purpose

This module manages identity, login, and role-based entry into the correct part of the system.

## 10.2 Registration (Detailed)

During registration, a user generally:

1. Chooses role path (Learner or Instructor).  
2. Enters full name.  
3. Enters email.  
4. Creates password and confirmation.  
5. Submits the form.  

After success:

- Account is created in the database.  
- Role is assigned.  
- User can sign in immediately (for normal learner/instructor registration).  

Optional profile details such as bio or profile picture can be completed later.

## 10.3 Sign-In (Detailed)

Sign-in supports:

- Email and password  
- Optional Google sign-in  

After successful authentication:

| Role | Landing area |
|------|--------------|
| Learner | Learner dashboard |
| Instructor | Instructor dashboard |
| Admin | Admin panel |

## 10.4 Technical Notes for This Module

- Backend auth endpoints handle register, login, current user info, and logout.  
- JWT cookie supports authenticated requests.  
- Frontend auth context keeps login state available across pages.  
- Protected routes prevent unauthorized page access.

## 10.5 Dashboard and Profile

### Dashboard
Shows current journey status and next actions, such as career goal, roadmap progress, current course, and continue-learning shortcuts.

### Profile
Shows personal identity and account details, and can display achievements such as certificates and badges.

# 11. MODULE 2 - CAREER GUIDANCE

## 11.1 Purpose

Career guidance sets the target before learning begins. Without a career target, a roadmap has no clear destination.

## 11.2 Career Hub Design

The Career area presents two clear options so every learner has a suitable entry path.

### Option A - Find My Career
For undecided learners.

**Detailed process:**
1. Learner answers interest questions.  
2. Each answer supports some careers more than others.  
3. System calculates match scores.  
4. Ranked career suggestions are displayed.  
5. Learner compares options and selects one.  
6. System continues to skills check for that career.

**Question themes may include:**
- Preferred work type (systems, interfaces, data, infrastructure)  
- Preferred daily activities  
- Desired impact  
- Comfort with logic, visual design, statistics, or automation  

### Option B - I Know My Career
For decided learners.

**Detailed process:**
1. Browse career list.  
2. Open career detail page.  
3. Review description, responsibilities, and required skills.  
4. Confirm career.  
5. Continue to skills check.

## 11.3 Example Careers in the System

- Backend Developer  
- Frontend Developer  
- Full Stack Engineer  
- Data Scientist  
- DevOps Engineer  
- Cloud Architect  
- Machine Learning Engineer  
- Mobile Developer  

## 11.4 Career Detail Information

A career page typically includes:

- Career name and category  
- Description of the role  
- Responsibilities  
- Required skills with importance levels  

## 11.5 Technical Notes for This Module

- Careers and career-skill relationships are stored in the database.  
- Discovery questions contain weighted options linked to careers.  
- Match calculation ranks careers by accumulated weights and normalized scores.  
- Admin interfaces allow updating careers and discovery questions.

## 11.6 Changing Career Later

Learners may change career goals later. In that case:

- A new skills check should be taken.  
- A new roadmap can be generated.  
- Previous completed courses remain in history, but recommendations adapt to the new goal.

# 12. MODULE 3 - SKILLS CHECK AND SKILL PROFILE

## 12.1 Purpose

The skills check estimates how ready a learner is for the selected career.

## 12.2 Why This Module Is Critical

If SkillHub recommended courses without measuring ability:

- Advanced learners would waste time on basics.  
- Beginners would be overwhelmed by advanced content.

## 12.3 Question Types

| Type | Description | Example use |
|------|-------------|-------------|
| Self-rating | Learner selects experience level | Beginner  to  Advanced |
| Knowledge / understanding | Multiple-choice checks | Verify real understanding |

Questions are selected according to the skills required by the chosen career.

## 12.4 Result Processing (Written Detail)

After submission, the system:

1. Groups answers by skill.  
2. Uses self-rating values and knowledge correctness.  
3. Estimates a final level per skill.  
4. Saves or updates the learner’s skill profile.  

This profile becomes the learner’s current ability map for roadmap generation.

## 12.5 Skill Gap Definition

A skill gap exists when:

> Required career level > Current learner level

Larger and more important gaps usually receive higher priority in planning.

## 12.6 Technical Notes for This Module

- Assessment questions are linked to skills in the database.  
- Backend assessment services grade answers and write user-skill records.  
- Admins can manage assessment questions through the admin panel.  
- Seed data includes self-rating and knowledge questions for key skills.

# 13. MODULE 4 - PERSONAL ROADMAP

## 13.1 Purpose

The personal roadmap converts skill gaps into an ordered learning plan.

## 13.2 Why Roadmaps Differ Between Users

Roadmaps are personal because:

- Different careers require different skills.  
- Different learners have different starting levels.  
- Different gaps need different courses and sequences.

## 13.3 Roadmap Generation Steps (Detailed)

1. Load selected career requirements.  
2. Load learner skill profile.  
3. Compute gaps.  
4. Find courses that teach the missing/weak skills.  
5. Order courses using prerequisites where needed.  
6. Save roadmap items with statuses.  
7. Display plan to the learner.

## 13.4 Roadmap Item States

| State | Meaning |
|-------|---------|
| Locked | Earlier required step not finished |
| Available | Ready to begin |
| In progress | Learner already enrolled and studying |
| Completed | Finished successfully |

## 13.5 What Learners See

- Career linked to the roadmap  
- Overall completion percentage  
- Ordered course steps  
- Recommendation reason (for example, closing a specific skill gap)  
- Start / Continue actions  

## 13.6 Roadmap Updates Over Time

When a course is completed:

- Related roadmap item becomes completed.  
- Progress percentage increases.  
- Next locked item may unlock.  
- Learner receives a clear next action.

## 13.7 Technical Notes for This Module

- Roadmap service compares user skills and career skills.  
- Course-skill mappings help select relevant courses.  
- Course prerequisites support logical ordering.  
- Enrollment progress syncs with roadmap item status.

# 14. MODULE 5 - COURSES AND LESSONS

## 14.1 Purpose

Courses and lessons deliver the actual learning content that closes skill gaps.

## 14.2 Course Discovery

Learners can find courses from:

- Personal roadmap recommendations  
- Full course catalog  
- Dashboard continue actions  
- My Learning page  

Course cards typically show title, category, difficulty, duration, rating, and short description.

## 14.3 Course Page Details

A course page generally includes:

- Full description  
- Difficulty and estimated duration  
- Skills related to the course  
- Lesson list  
- Reviews and ratings  
- Enroll / Continue button  

## 14.4 Lesson Learning Experience

After enrollment, learners open lessons that may include:

- Explanations  
- Examples  
- Practical demonstrations  
- Estimated study time  

Learners can move sequentially or jump via lesson navigation, then continue later from saved progress.

## 14.5 Enrollment and Completion Logic

Important actions include:

- Enroll in a course  
- Mark lessons complete  
- Complete the full course  
- Optionally submit a course assessment  
- Write a rating/review  

A dedicated complete-course action is important because learners may skip around lessons. Completing the whole course ensures progress and certificate issuance remain reliable.

## 14.6 My Learning

My Learning acts as a personal library of:

- In-progress courses  
- Completed courses  
- Quick continue shortcuts  

## 14.7 Technical Notes for This Module

- Course and lesson data are stored relationally.  
- Enrollment records track progress percentage and completion.  
- Lesson progress records support fine-grained completion tracking.  
- Review APIs store ratings and written feedback.  
- Instructor and admin tools manage course lifecycle (draft  to  pending  to  published/rejected).

# 15. MODULE 6 - LEARNING SUPPORT (AI HELPER AND MESSAGING)

## 15.1 Purpose

Support tools reduce frustration and help learners continue when they get stuck.

## 15.2 AI Study Helper (Detailed)

During lesson study, learners can ask the AI helper for:

- Simpler explanation  
- Examples  
- Lesson summary  
- Clarification of a difficult part  
- Practice questions  
- Hints without full answers  

The helper uses the current lesson context so responses stay relevant to what the learner is studying.

### Technical Note
Backend AI service communicates with Google Gemini using the lesson title/content and user prompt. Environment configuration stores the API key securely.

## 15.3 Instructor Messaging (Detailed)

Learners can message instructors for human support. Typical needs include:

- Concept clarification  
- Course-specific advice  
- Motivation and mentoring style questions  

Messaging is available from learning pages and from a dedicated Messages area.

## 15.4 Notifications

To avoid missed replies, SkillHub provides:

- Unread counters in navigation  
- Toast-style alerts  
- Optional notification sound  

Seen state is tracked so notifications clear after conversations are opened.

### Technical Note
Chat uses REST APIs with frontend polling for near-real-time unread updates (rather than depending only on a page already being open).

## 15.5 Choosing Support Type

| Need | Recommended support |
|------|---------------------|
| Quick rephrase or example | AI helper |
| Summary of current lesson | AI helper |
| Personal judgment / mentoring | Instructor message |
| Course-specific human help | Instructor message |

# 16. MODULE 7 - PROGRESS, CERTIFICATES, AND BADGES

## 16.1 Purpose

This module makes learning progress visible and provable.

## 16.2 Progress Tracking Dimensions

Learners can track:

- Lesson-level progress  
- Course-level progress  
- Roadmap-level progress  
- Historical completed learning  

## 16.3 Certificates

When a learner completes an eligible course, SkillHub can issue a certificate.

A certificate represents:

- Course enrollment  
- Successful completion  
- System-recorded achievement  

Certificates are available in the Certificates area and may also appear in profile-related views.

## 16.4 Badges

Badges provide lighter recognition for achievements and milestones. They support motivation in addition to formal certificates.

## 16.5 Completion-to-Recognition Flow

1. Learner finishes lessons / completes course.  
2. System records completion.  
3. Certificate and/or badge can be issued.  
4. Learner may rate and review the course.  
5. Roadmap status updates for next steps.

## 16.6 Technical Notes

- Enrollment completion logic issues certificate/badge records.  
- A dedicated complete-course endpoint helps avoid missing certificates when lessons were completed out of order.  
- Frontend waits for completion before loading certificate display to reduce timing issues.

# 17. MODULE 8 - SKILL EXCHANGE

## 17.1 Purpose

Skill Exchange adds collaborative practice. Courses teach concepts; projects help learners apply skills with peers.

## 17.2 Learner Capabilities

- Browse recruiting projects  
- View required skills, level, duration, and team size  
- Create projects  
- Apply to join  
- Approve/reject join requests (owners)  
- Comment and discuss  
- Track own projects and requests  

## 17.3 Example Project Types

- Team learning website project  
- Cloud setup practice group  
- Data analysis mini-project  
- Open learning-tool improvement project  

## 17.4 Place in Overall Journey

Recommended pattern:

> Learn concept in a course  to  practice in Skill Exchange  to  return to roadmap for next skill.

## 17.5 Technical Notes

- Projects, members, join requests, and comments are stored as related records.  
- Admin moderation supports approve/flag/delete actions.  
- Seed data can include sample projects for demonstration.

# 18. MODULE 9 - INSTRUCTOR SYSTEM

## 18.1 Purpose

Enable instructors to create quality learning content and support enrolled/contacting learners.

## 18.2 Instructor Dashboard Details

Instructors can monitor:

- Total courses  
- Draft / pending / published / rejected counts  
- Enrollment numbers  
- Average ratings  
- Recent reviews  

## 18.3 Course Authoring Details

Instructors provide:

### Basic Information
- Title  
- Descriptions  
- Difficulty  
- Duration  

### Learning Information
- Objectives  
- Prerequisites  
- Skills taught  

### Content
- Ordered lessons  
- Lesson materials and examples  

## 18.4 Course Lifecycle

1. Draft  
2. Pending approval  
3. Published  
4. Rejected (with reason for improvement)

## 18.5 Instructor Messaging

Instructors use an inbox to reply to learner questions and receive unread notifications.

## 18.6 Technical Notes

- Instructor APIs support course create/update/submit and stats.  
- Course editor pages in frontend handle structured authoring.  
- Published visibility depends on admin approval workflow.

# 19. MODULE 10 - ADMIN SYSTEM

## 19.1 Purpose

Admins maintain the structure that makes personalization possible and keep content quality high.

## 19.2 Admin Areas in Detail

| Area | Admin responsibilities |
|------|------------------------|
| Users | Review accounts; enable/disable when needed |
| Skills | Create and maintain shared skill definitions |
| Careers | Define careers and required skill levels/importance |
| Discovery questions | Maintain Find My Career question bank |
| Assessment questions | Maintain skills-check question bank |
| Courses | Approve/reject/edit course and lesson content |
| Reviews | Remove inappropriate feedback |
| Skill Exchange | Moderate projects |
| Stats | Monitor overall platform activity |

## 19.3 Why Admin Setup Determines Roadmap Quality

If careers, skills, or questions are incomplete:

- Discovery becomes inaccurate.  
- Skills checks become weak.  
- Roadmaps cannot recommend correct courses.

Therefore admin configuration is foundational, not optional.

## 19.4 Technical Notes

- Admin controllers provide secured management APIs.  
- Frontend admin panel pages map to each management area.  
- Only Admin role should access these controls.

# 20. ENTITY RELATIONSHIP (ER) DESIGN

## 20.1 Purpose of This Section

This section is reserved for the Entity Relationship (ER) design of SkillHub. Insert your ER diagram here and briefly explain the main entities and relationships.

## 20.2 Instructions for Author

1. Insert your ER diagram image below.
2. List the main entities (for example User, Career, Skill, Course, Lesson, Enrollment, Roadmap Item, Certificate, Chat Message, Project).
3. Briefly describe important relationships in short paragraphs or a simple table.
4. Keep explanations clear and related to the system modules already described in this report.

## 20.3 Space for ER Diagram

[Insert ER Diagram Here]

## 20.4 Main Entities (Write Your Explanation Here)

Write a short explanation of each major entity and what data it stores.

## 20.5 Main Relationships (Write Your Explanation Here)

Write how the main entities are related. For example, how User connects to Enrollment, how Career connects to Skill, and how Course connects to Lesson.

# 21. SYSTEM FLOWCHART

## 21.1 Purpose of This Section

This section is reserved for system flowcharts of SkillHub. Insert your flowchart diagrams here and briefly explain the process shown in each chart.

## 21.2 Suggested Flowcharts to Include

1. Overall learner journey flowchart
2. Career discovery and selection flowchart
3. Skills check and roadmap generation flowchart
4. Course enrollment and completion flowchart
5. Instructor course approval flowchart
6. Admin moderation flowchart (optional)

## 21.3 Instructions for Author

1. Insert each flowchart on its own page if possible.
2. Add a short title above each chart.
3. Add 3 to 6 lines of explanation under each chart.
4. Use clear start and end points in every flowchart.

## 21.4 Space for Flowcharts

### Flowchart 1: Overall Learner Journey

[Insert Flowchart Here]

Explanation:

Write your explanation here.

### Flowchart 2: Career Choice Process

[Insert Flowchart Here]

Explanation:

Write your explanation here.

### Flowchart 3: Skills Check and Roadmap Generation

[Insert Flowchart Here]

Explanation:

Write your explanation here.

### Flowchart 4: Course Learning and Certificate Issuance

[Insert Flowchart Here]

Explanation:

Write your explanation here.

# 22. HOW ALL MODULES CONNECT

## 21.1 Dependency Chain

1. Skills
2. to  Careers (required skills)
3. to  Skills Check (current levels)
4. to  Skill Gaps
5. to  Courses that teach those skills
6. to  Personal Roadmap
7. to  Lessons + Support
8. to  Certificates / Badges
9. to  Skill Exchange practice

## 21.2 Failure Impact Table

| Missing piece | User impact |
|---------------|-------------|
| No careers | No target goal |
| No career skills | No assessment target |
| No assessment questions | Weak skill profile |
| No matching courses | Weak roadmap recommendations |
| No approvals | Instructor content not visible |
| No support tools | Higher dropout risk |
| No certificates | Weak sense of completion |

## 21.3 Healthy Platform Checklist

- Clear careers and skill requirements  
- Discovery questions that separate similar careers  
- Assessment coverage for important skills  
- Courses mapped to those skills  
- Active instructor support  
- Timely admin approvals  
- Learners completing and reviewing courses  

# 23. DETAILED USE CASE SCENARIOS

## 22.1 Use Case A - Undecided Beginner (Maya)

1. Registers as learner and signs in.  
2. Opens Career  to  Find My Career.  
3. Answers interest questions.  
4. Receives Frontend Developer as a top suggestion.  
5. Confirms career and takes skills check.  
6. Gets roadmap focused on weaker frontend skills.  
7. Enrolls, uses AI helper, messages instructor once.  
8. Completes course, reviews it, earns certificate.  
9. Next roadmap course unlocks.  
10. Joins a Skill Exchange practice project.

## 22.2 Use Case B - Decided Learner (Arun)

1. Chooses I Know My Career  to  Backend Developer.  
2. Skills check shows strong databases, weaker containers.  
3. Roadmap prioritizes missing skills instead of repeating strengths.  
4. Learns efficiently because the plan is personalized.

## 22.3 Use Case C - Instructor (Lina)

1. Creates a course with lessons and skill mapping.  
2. Submits for approval.  
3. Admin publishes it.  
4. Learners begin receiving it in relevant roadmaps/catalog.  
5. Lina answers questions and improves content from reviews.

## 22.4 Use Case D - Admin (Sam)

1. Improves discovery questions for similar careers.  
2. Checks assessment and course coverage for key skills.  
3. Approves new instructor courses.  
4. Platform recommendations become more accurate.

# 24. FEATURES SUMMARY BY ROLE

## 23.1 Learner Features

- Registration and login  
- Dashboard and profile  
- Find My Career / I Know My Career  
- Career details  
- Skills check and skill profile  
- Personal roadmap  
- Course catalog, enrollment, lessons  
- Course completion, ratings, reviews  
- My Learning  
- AI study helper  
- Instructor messaging + notifications  
- Certificates and badges  
- Skill Exchange participation  

## 23.2 Instructor Features

- Instructor dashboard and statistics  
- Course/lesson authoring  
- Submit for approval  
- Learner messaging inbox  

## 23.3 Admin Features

- User management  
- Skills and careers management  
- Discovery and assessment question management  
- Course approval workflow  
- Review and Skill Exchange moderation  
- Platform statistics  

# 25. EXPECTED BENEFITS

## 24.1 Benefits for Learners

- Clear career direction  
- Better understanding of current skills  
- Personal learning plan  
- Less wasted effort on unrelated courses  
- Support when stuck  
- Visible progress and certificates  
- Peer practice opportunities  

## 24.2 Benefits for Instructors

- Structured course publishing process  
- Direct communication with learners  
- Feedback through ratings and reviews  

## 24.3 Benefits for Admins

- Central control of careers and skills  
- Quality control through approvals  
- Safer community through moderation  

## 24.4 Technical / Academic Benefits

- Demonstrates full-stack engineering  
- Shows role-based system design  
- Shows integration of assessment logic and recommendation flow  
- Shows practical use of modern web frameworks and database design  

# 26. TESTING AND VALIDATION APPROACH

## 25.1 Functional Validation Examples

| Flow | What to verify |
|------|----------------|
| Register/Login | Correct role landing page |
| Find My Career | Suggestions appear after questions |
| Skills check | Skill profile is saved |
| Roadmap generation | Courses match gaps |
| Enrollment/Lessons | Progress increases |
| Complete course | Certificate appears |
| Messaging | Unread notifications update |
| Instructor submit | Course becomes pending |
| Admin approve | Course becomes visible |

## 25.2 Role Validation

- Learner cannot access admin controls.  
- Instructor can manage own course authoring features.  
- Admin can access management panels.

## 25.3 Content Validation

- Every important career skill should have assessment coverage.  
- Important skills should have at least one related course.  
- Roadmap should not remain empty for standard demo careers.

# 27. LIMITATIONS AND FUTURE IMPROVEMENTS

## 26.1 Current Limitations

- Some advanced quiz/assignment experiences may still be lighter than full enterprise LMS features.  
- Recommendation quality depends on good admin content setup.  
- AI answers depend on external API availability and key configuration.  
- Real-time chat is polling-based rather than fully push-based in the current implementation style.

## 26.2 Future Improvements

1. Richer per-lesson quizzes and graded assignments  
2. Stronger analytics dashboards for learners and instructors  
3. Improved career comparison tools  
4. Smarter long-term recommendations based on learning history  
5. Enhanced Skill Exchange matching  
6. Mobile application versions  
7. Broader career library and multilingual support  
8. Stronger notification center and email alerts  

# 28. CONCLUSION

SkillHub is a full-stack career-guided learning platform designed to solve a real problem: learners know they want growth, but they often do not know what to learn next.

The system combines:

- Career guidance  
- Skills assessment  
- Personalized roadmaps  
- Courses and lessons  
- AI and instructor support  
- Certificates and badges  
- Peer collaboration  
- Instructor authoring  
- Admin quality control  

Technically, SkillHub is built with **React (Vite) on the frontend**, **Spring Boot (Java) on the backend**, **PostgreSQL as the database**, **JWT/Spring Security for access control**, and **Google Gemini for AI learning support**.

Organizationally, three roles cooperate:

1. **Admins** define structure and quality gates.  
2. **Instructors** create and support learning content.  
3. **Learners** follow a personal path from career goal to measurable progress.

The heart of the system remains:

**Choose a career  to  check skills  to  find gaps  to  follow roadmap  to  learn courses  to  get help  to  finish and earn recognition  to  unlock the next step.**

This makes SkillHub not only a course website, but a complete guided learning system suitable as a substantial academic/project demonstration.

# 29. REFERENCES / TOOLS SUMMARY

## 28.1 Major Technologies

- React.js  
- Vite  
- React Router DOM  
- Axios  
- Spring Boot  
- Spring Security  
- Spring Data JPA  
- JWT (JJWT)  
- Spring OAuth2 Client  
- PostgreSQL  
- Maven  
- Java 21  
- Google Gemini API  
- Node.js / npm  
- Git / GitHub  

## 28.2 Project Deliverables Related to This Report

- Working frontend application  
- Working backend API  
- Database-backed core features  
- Role-based user journeys  
- Seeded demo content for careers, assessments, and courses  
- Documentation set describing system flow and project report  

# END OF PROJECT REPORT

**Project Name:** SkillHub  
**Report Title:** Project System Report (Detailed + Technologies)  
**How to use:** Copy this document into Microsoft Word or Google Docs. Apply Heading 1 to chapter titles and Heading 2 to sub-sections for a clean formal report format.
