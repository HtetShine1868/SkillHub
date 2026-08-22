====================================================================
PERSONALIZED CAREER LEARNING PLATFORM
COMPLETE SYSTEM + ALGORITHM + UI + WORKFLOW SPECIFICATION
====================================================================


====================================================================
1. SYSTEM PURPOSE
====================================================================

Build a personalized career learning platform for students.

The platform helps a student go from:

"I don't know what career I want."

OR:

"I know what career I want."

to:

"I know what skills I need."

"I know what skills I already have."

"I know what I need to learn."

"I have a personalized roadmap."

"I can learn through structured courses."

"I can ask an AI assistant when I don't understand."

"I can prove my knowledge through assessments."

"I can earn certificates."

"I can build my skills."

"I can find projects and teammates through Skill Exchange."


The platform must NOT depend on AI for every feature.

Use normal application logic and algorithms for:

- Career matching
- Skill assessment
- Skill gap analysis
- Roadmap generation
- Course recommendation
- Course ordering
- Progress tracking
- Assessment scoring
- Certificate eligibility
- Skill updates
- Skill Exchange matching

Use AI mainly for:

- Explaining concepts
- Explaining code
- Simplifying difficult topics
- Summarizing lessons
- Giving examples
- Answering questions related to the current lesson


====================================================================
2. HIGH-LEVEL ARCHITECTURE
====================================================================

FRONTEND
React + Vite

        |
        | REST API
        v

BACKEND
Spring Boot

        |
        +----------------------+
        |                      |
        v                      v

DATABASE                AI SERVICE
PostgreSQL              AI Provider
        |
        +----------------------------------+
        |          |          |            |
        v          v          v            v

Career      Skill       Course       Skill Exchange
System      System      System       System


Main backend modules:

Authentication
User Profile
Career Discovery
Career
Skill
Assessment
Roadmap
Course
Learning Progress
Quiz
Certificate
AI Tutor
Skill Exchange
Matching


====================================================================
3. MAIN USER FLOW
====================================================================

NEW USER

        |
        v

CAREER ONBOARDING

        |
        +-------------------------+
        |                         |
        v                         v

FIND MY CAREER              I KNOW MY CAREER

        |                         |
        v                         v

CAREER QUESTIONS            CHOOSE CAREER

        |                         |
        v                         |
CAREER MATCHING                    |
        |                         |
        +------------+------------+
                     |
                     v
              CAREER DETAIL
                     |
                     v
           START ROADMAP PROCESS
                     |
                     v
             SKILL ASSESSMENT
                     |
                     v
             SKILL PROFILE
                     |
                     v
             SKILL GAP ANALYSIS
                     |
                     v
          COURSE RECOMMENDATION
                     |
                     v
             ROADMAP GENERATION
                     |
                     v
                LEARNING
                     |
                     v
          LESSON + AI ASSISTANT
                     |
                     v
             PROGRESS TRACKING
                     |
                     v
                QUIZ
                     |
                     v
           FINAL ASSESSMENT
                     |
             +-------+-------+
             |               |
            FAIL            PASS
             |               |
             v               v
       CONTINUE LEARNING   COMPLETION
                             |
                  +----------+----------+
                  |          |          |
                  v          v          v
                BADGE   CERTIFICATE   SKILL UPDATE
                                         |
                                         v
                                  SKILL EXCHANGE
                                         |
                                         v
                                  MATCHING ALGORITHM
                                         |
                         +---------------+---------------+
                         |                               |
                         v                               v
                  PROJECT MATCH                  TEAMMATE MATCH
                         |                               |
                         v                               v
                       APPLY                           INVITE
                         |                               |
                         +---------------+---------------+
                                         |
                                         v
                                  ACCEPT / REJECT
                                         |
                                         v
                                      TEAM


====================================================================
4. DATA MODEL
====================================================================

The personalization system depends heavily on relationships
between users, careers, skills, courses, and assessments.


USER

id
name
email
...


USER_SKILL

id
user_id
skill_id
current_level
confidence
source
updated_at


SKILL

id
name
category
description


CAREER

id
name
description
category


CAREER_SKILL

career_id
skill_id
required_level
importance


COURSE

id
title
description
difficulty
duration


COURSE_SKILL

course_id
skill_id
target_level
importance


COURSE_PREREQUISITE

course_id
required_course_id


LESSON

id
course_id
title
content
order_index


ENROLLMENT

user_id
course_id
status
progress
started_at
completed_at


LESSON_PROGRESS

user_id
lesson_id
completed
completed_at


ASSESSMENT

id
type
course_id


ASSESSMENT_QUESTION

assessment_id
question
correct_answer
skill_id
difficulty


ASSESSMENT_ATTEMPT

user_id
assessment_id
score
completed_at


CERTIFICATE

user_id
course_id
certificate_id
issued_at


BADGE

user_id
course_id
badge_type
earned_at


PROJECT

id
owner_id
title
description


PROJECT_REQUIREMENT

project_id
skill_id
required_level
importance
role


PROJECT_MEMBER

project_id
user_id
role


PROJECT_APPLICATION

project_id
user_id
status


PROJECT_INVITATION

project_id
user_id
status


====================================================================
5. SKILL SYSTEM
====================================================================

Skills are the central connection between:

CAREERS

COURSES

USERS

ASSESSMENTS

ROADMAPS

SKILL EXCHANGE


Example:

                    Backend Developer
                           |
                           |
          +----------------+----------------+
          |                |                |
          v                v                v

         Java         Spring Boot        REST API
          |                |                |
          v                v                v
      Courses          Courses          Courses
          |                |                |
          +----------------+----------------+
                           |
                           v
                     User Skills
                           |
                           v
                   Skill Exchange


====================================================================
6. SKILL LEVEL SYSTEM
====================================================================

Use a consistent skill scale.

0 = No Experience

1 = Beginner

2 = Elementary

3 = Intermediate

4 = Advanced

5 = Expert


Do NOT use different scales in different parts of
the application.


Example:

Java = 3

means:

Intermediate


====================================================================
7. CAREER SKILL REQUIREMENTS
====================================================================

Every career must have required skills.

Example:


CAREER:

Backend Developer


CAREER SKILLS:


Java
required_level = 4
importance = 0.90


Spring Boot
required_level = 4
importance = 1.00


REST API
required_level = 4
importance = 0.95


SQL
required_level = 3
importance = 0.80


Git
required_level = 3
importance = 0.60


Docker
required_level = 2
importance = 0.40


This data is maintained by the system/admin.

It is NOT generated dynamically by AI.


====================================================================
8. CAREER DISCOVERY ALGORITHM
====================================================================

Purpose:

Recommend careers when the user doesn't know what career
they want.


INPUT:

User answers


OUTPUT:

Ranked careers


Each question option has career weights.


Example:


Question:

"What sounds more interesting?"


Option:

"Building the system behind an application"


Weights:


Backend Developer = 5

Software Developer = 4

DevOps Engineer = 2

Data Analyst = 1


If the user selects this:

careerScores["Backend Developer"] += 5

careerScores["Software Developer"] += 4

careerScores["DevOps Engineer"] += 2

careerScores["Data Analyst"] += 1


Repeat for all questions.


====================================================================
9. CAREER SCORE NORMALIZATION
====================================================================

Raw scores should be converted into a percentage.


Example:


Backend Developer = 47 points

Maximum possible score = 50


matchPercentage =

47 / 50 * 100


Result:

94%


Sort careers:

1. Backend Developer - 94%
2. Software Developer - 86%
3. Data Analyst - 75%


Show top 3-5 careers.


====================================================================
10. CAREER DISCOVERY SHOULD NOT DECIDE FOR THE USER
====================================================================

The algorithm only recommends.

It should NOT say:

"You must become a Backend Developer."


Instead:

"These careers may fit your interests."


The user can:

- Read career information
- Compare careers
- Select another career
- Choose their preferred career


Human choice is final.


====================================================================
11. CAREER DETAIL PAGE
====================================================================

The user sees:

Career description

Responsibilities

Typical skills

Required skills

Learning path

Career match percentage

Recommended roadmap


Primary action:

[ Generate My Roadmap ]


====================================================================
12. SKILL ASSESSMENT SYSTEM
====================================================================

After selecting a career, the user takes a skill assessment.

Purpose:

Determine what the user already knows.

The assessment should prevent the roadmap from teaching
things the user already understands.


Use two types of information:


TYPE 1:

SELF-ASSESSMENT


Example:

How comfortable are you with Java?


TYPE 2:

KNOWLEDGE QUESTIONS


Example:

What does dependency injection mean?


TYPE 3:

PRACTICAL QUESTIONS


Example:

Which code correctly creates a REST endpoint?


Use actual questions to verify self-reported knowledge.


====================================================================
13. ASSESSMENT QUESTION -> SKILL MAPPING
====================================================================

Every assessment question should be connected to a skill.


Example:


Question:

"What does @RestController do?"


skill_id:

SPRING_BOOT


difficulty:

2


correct_answer:

B


Therefore, when the user answers:


Correct:

+ evidence for Spring Boot


Incorrect:

- no positive evidence


The system accumulates evidence across questions.


====================================================================
14. ASSESSMENT SCORING
====================================================================

For each skill:


skillScore =

weightedCorrectAnswers /
weightedQuestions


Example:


Spring Boot questions:

Q1 = difficulty 1
Q2 = difficulty 2
Q3 = difficulty 3


If the user gets:

Q1 correct
Q2 correct
Q3 wrong


The system calculates a weighted score.


Then convert score to level.


Example:


0-19%  = Level 0

20-39% = Level 1

40-59% = Level 2

60-74% = Level 3

75-89% = Level 4

90-100% = Level 5


The exact thresholds can be configured by admin.


====================================================================
15. SELF-ASSESSMENT VS ACTUAL ASSESSMENT
====================================================================

Do not completely trust self-reported skills.

Example:


User says:

Spring Boot = Advanced


But assessment result:

Spring Boot = Beginner


The verified assessment should have greater weight.


Example:


finalSkillLevel =

assessmentLevel * 0.75

+

selfReportedLevel * 0.25


This creates a more reliable profile.


====================================================================
16. USER SKILL PROFILE
====================================================================

After assessment:


USER:

Htet


SKILLS:


Java
Level 3
Source: Assessment


Spring Boot
Level 1
Source: Assessment


REST API
Level 1
Source: Assessment


SQL
Level 2
Source: Assessment


This becomes the starting point for roadmap generation.


====================================================================
17. SKILL GAP ALGORITHM
====================================================================

The system compares:


CURRENT USER LEVEL


against:


REQUIRED CAREER LEVEL


Example:


CAREER:

Backend Developer


Required:

Java = 4

Spring Boot = 4

REST API = 4

SQL = 3


User:

Java = 3

Spring Boot = 1

REST API = 1

SQL = 2


Calculate:


gap = requiredLevel - currentLevel


Java:

4 - 3 = 1


Spring Boot:

4 - 1 = 3


REST API:

4 - 1 = 3


SQL:

3 - 2 = 1


If:

gap <= 0

then the user already meets the requirement.


Do NOT recommend beginner courses unnecessarily.


====================================================================
18. SKILL GAP PRIORITY
====================================================================

Not all skills are equally important.

Use career importance.


Example:


Spring Boot:

gap = 3

importance = 1.0


REST API:

gap = 3

importance = 0.95


Java:

gap = 1

importance = 0.90


SQL:

gap = 1

importance = 0.80


Calculate:


priorityScore =

gap * importance


Results:


Spring Boot:

3 * 1.0 = 3.0


REST API:

3 * 0.95 = 2.85


Java:

1 * 0.90 = 0.90


SQL:

1 * 0.80 = 0.80


Therefore:

1. Spring Boot
2. REST API
3. Java
4. SQL


This determines what the roadmap should focus on.


====================================================================
19. COURSE-SKILL RELATIONSHIP
====================================================================

Every course must specify:

- skills it teaches
- target level
- difficulty
- prerequisites


Example:


COURSE:

Spring Boot Fundamentals


Skills:

Spring Boot
targetLevel = 2


Java
targetLevel = 3


REST API
targetLevel = 1


This allows the system to connect courses
to skill gaps.


====================================================================
20. COURSE RECOMMENDATION ALGORITHM
====================================================================

For every course:


Calculate a recommendation score.


Possible factors:


Skill Gap Relevance = 40%


Career Importance = 20%


Skill Level Fit = 15%


Prerequisite Availability = 15%


Course Difficulty Fit = 10%


Example:


courseScore =

skillGapRelevance * 0.40

+

careerImportance * 0.20

+

skillLevelFit * 0.15

+

prerequisiteFit * 0.15

+

difficultyFit * 0.10


Rank courses by score.


====================================================================
21. COURSE FILTERING
====================================================================

Before ranking courses, remove courses that:

- teach irrelevant skills
- are already completed
- are too advanced for the user's current level
- have unmet prerequisites


Example:


User:

Spring Boot = Beginner


Course:

Spring Boot Advanced


If prerequisite:

Spring Boot Intermediate


is not satisfied:


DO NOT recommend it as the next course.


It can still appear in the general Courses page,
but should not be recommended as the next roadmap step.


====================================================================
22. COURSE PREREQUISITE SYSTEM
====================================================================

Example:


Java Fundamentals

        ↓

OOP

        ↓

Spring Boot Fundamentals

        ↓

REST API

        ↓

Spring Data

        ↓

Spring Security


Represent prerequisites as relationships.


Example:


REST API course

requires:

Spring Boot Fundamentals


Spring Security

requires:

Spring Boot Fundamentals

+

REST API


The roadmap should respect these dependencies.


====================================================================
23. ROADMAP GENERATION ALGORITHM
====================================================================

The roadmap is NOT simply:

"Sort courses by popularity."


It should be:

USER SKILLS

+

CAREER REQUIREMENTS

+

SKILL GAPS

+

COURSE SKILLS

+

PREREQUISITES

+

COURSE LEVEL


Then generate the learning path.


Algorithm:


STEP 1:

Get career.


STEP 2:

Get required career skills.


STEP 3:

Get user skill levels.


STEP 4:

Calculate gaps.


STEP 5:

Prioritize gaps.


STEP 6:

Find courses that address those gaps.


STEP 7:

Remove completed courses.


STEP 8:

Check prerequisites.


STEP 9:

Rank courses.


STEP 10:

Build dependency-aware order.


STEP 11:

Create roadmap milestones.


STEP 12:

Return roadmap.


====================================================================
24. ROADMAP EXAMPLE
====================================================================

User:


Java = 3

Spring Boot = 1

REST API = 1

SQL = 2


Goal:


Backend Developer


System finds:


HIGH PRIORITY:

Spring Boot

REST API


MEDIUM:

SQL


LOWER:

Java


Roadmap:


1. Spring Boot Fundamentals

2. REST API with Spring Boot

3. Spring Data JPA

4. Spring Security

5. Backend Project


Notice:

The user doesn't get:

"Java Fundamentals"


because they already have enough Java knowledge.


This is what makes the roadmap personalized.


====================================================================
25. ROADMAP MILESTONE SYSTEM
====================================================================

Each roadmap item should contain:


roadmapItemId

userId

courseId

orderIndex

status

progress

requiredBefore

reason


Status:


LOCKED

AVAILABLE

IN_PROGRESS

COMPLETED


Example:


Spring Boot Fundamentals

status:

IN_PROGRESS


REST API

status:

LOCKED


reason:

"Complete Spring Boot Fundamentals first."


====================================================================
26. ROADMAP PROGRESS
====================================================================

Overall roadmap progress:


completedMilestones /
totalMilestones * 100


Example:


8 completed

20 total


Progress:

40%


Course progress should also contribute
to milestone completion where appropriate.


====================================================================
27. DYNAMIC ROADMAP UPDATE
====================================================================

The roadmap should not be permanently fixed.

When the user:

- completes courses
- passes assessments
- improves skills
- changes career


the system can recalculate future recommendations.


Example:


Initial:

Spring Boot = Beginner


After course:


Spring Boot = Intermediate


The next recommendation may change.


The system should NOT delete historical achievements.

Instead update only future roadmap items.


====================================================================
28. COURSE LEARNING SYSTEM
====================================================================

Courses are reading-based.


Each course contains:


Course Information

        ↓

Learning Objectives

        ↓

Lessons

        ↓

Examples

        ↓

Code Examples

        ↓

Exercises

        ↓

Quizzes

        ↓

Final Assessment

        ↓

Certificate


====================================================================
29. LESSON CONTENT
====================================================================

Each lesson can contain:


Title

Introduction

Concept Explanation

Code Example

Real-world Example

Practice

Key Takeaways


Example:


Lesson:

Dependency Injection


Section 1:

What is Dependency Injection?


Section 2:

Why is it useful?


Section 3:

How Spring implements it


Section 4:

Code Example


Section 5:

Practice Exercise


Section 6:

Summary


====================================================================
30. LEARNING PROGRESS ALGORITHM
====================================================================

Track each lesson.


Lesson status:


NOT_STARTED

IN_PROGRESS

COMPLETED


Course progress:


completedLessons /
totalRequiredLessons * 100


Example:


6 / 10


= 60%


Do not rely only on the frontend.

The backend should be the source of truth.


====================================================================
31. AI LEARNING ASSISTANT
====================================================================

AI exists primarily inside lessons.


Actions:


1. Explain Concept

2. Explain Code

3. Simplify

4. Summarize

5. Give Example

6. Ask Question


The AI should be context-aware.


====================================================================
32. AI CONTEXT PIPELINE
====================================================================

User opens:


Course:

Spring Boot Fundamentals


Lesson:

Dependency Injection


User asks:

"Explain this simply."


Frontend sends:


courseId

lessonId

action

question


Backend retrieves:


Course information

Lesson information

Lesson content

Selected text if any


Then:


BACKEND

      ↓

Build AI Prompt

      ↓

AI Provider

      ↓

Response

      ↓

Frontend


====================================================================
33. AI PROMPT CONTEXT
====================================================================

AI receives:


COURSE:

Spring Boot Fundamentals


LESSON:

Dependency Injection


LESSON CONTENT:

[Relevant content]


USER REQUEST:

Explain this simply.


RULE:

Only answer based on the current lesson
and closely related educational context.

If the question is unrelated,
tell the user that it is outside the current
lesson context.


This prevents the AI assistant from becoming
an uncontrolled general chatbot.


====================================================================
34. AI ACTION: EXPLAIN
====================================================================

Input:

Concept


Output:


Simple definition

How it works

Why it matters

Example


====================================================================
35. AI ACTION: EXPLAIN CODE
====================================================================

Input:


Selected code


Output:


What the code does

Important lines

How the components interact

Why the code is written this way


The AI should not just repeat the code.


====================================================================
36. AI ACTION: SIMPLIFY
====================================================================

Convert difficult technical explanations
into beginner-friendly explanations.


Use:

- simple language
- analogies
- short examples


====================================================================
37. AI ACTION: SUMMARIZE
====================================================================

Return:


Key concept

Important points

Important code idea

Things to remember


Do not generate an unnecessarily long response.


====================================================================
38. AI ACTION: GIVE EXAMPLE
====================================================================

Example must relate to:

Current course

Current lesson


If lesson:

Dependency Injection


Example should be related to:

Spring dependency injection


not an unrelated topic.


====================================================================
39. AI SECURITY
====================================================================

Never put AI API keys in React.


Correct:


React

   ↓

Spring Boot

   ↓

AI Provider


The backend owns the AI credentials.


Also verify:


User authentication

Course access

Lesson ownership

Request limits


====================================================================
40. OFFICIAL ASSESSMENT
====================================================================

Normal learning:

AI = AVAILABLE


Official assessment:

AI = DISABLED


Reason:

The assessment measures the user's actual knowledge.


====================================================================
41. QUIZ SYSTEM
====================================================================

Quizzes can appear inside lessons.


Types:


Multiple Choice

True/False

Multiple Answer

Code Questions


The system stores:


Question

Correct Answer

Skill

Difficulty


This allows assessment results
to contribute to skill evidence.


====================================================================
42. FINAL ASSESSMENT ALGORITHM
====================================================================

Example:


20 questions


Score:


correct / total * 100


Passing:


>= 70%


If:


score >= passingScore


then:

PASS


otherwise:

FAIL


The system should store the attempt.


====================================================================
43. COURSE COMPLETION
====================================================================

A course is completed only when:


Required lessons completed

AND

Final assessment passed


Optional exercises may also be required
depending on course configuration.


Then:


course.status = COMPLETED


====================================================================
44. CERTIFICATE ALGORITHM
====================================================================

If:


courseCompleted == true


then:


Generate certificate.


Certificate contains:


Unique ID

User

Course

Date

Score

Skills


Example:


CERT-2026-8F72A1


The certificate should be verifiable.


====================================================================
45. SKILL UPDATE ALGORITHM
====================================================================

Do NOT simply:


Course completed
=
Skill automatically becomes Advanced.


Instead collect evidence.


Evidence:


Assessment Score

Course Completion

Quiz Results

Exercises

Projects


Example:


Before:

Spring Boot = Level 1


After course:

Final assessment = 90%


System calculates new evidence.


Possible:


Spring Boot = Level 2


If score is insufficient:


Skill may remain Level 1.


This makes the skill profile more trustworthy.


====================================================================
46. SKILL EXCHANGE
====================================================================

Purpose:


Connect users based on complementary skills.


Example:


User A:


Backend Developer

Java

Spring Boot

SQL


User B:


Frontend Developer

React

JavaScript

CSS


User C:


UI/UX Designer

Figma

UI Design


A project requiring:


Backend

Frontend

UI/UX


can match all three.


====================================================================
47. PROJECT REQUIREMENTS
====================================================================

Every project has:


Role

Skill

Required Level

Importance


Example:


Backend Developer


Java

Level 3

Importance = 1.0


Spring Boot

Level 3

Importance = 1.0


SQL

Level 2

Importance = 0.7


====================================================================
48. SKILL EXCHANGE MATCHING ALGORITHM
====================================================================

For:

USER -> PROJECT


Compare:


User Skills

with

Project Requirements


For every required skill:


skillMatch =


min(userLevel / requiredLevel, 1)


Example:


Required:


Java = 4


User:


Java = 3


skillMatch:


3 / 4 = 0.75


If user has:

Java = 4


then:


4 / 4 = 1.0


If:

Java = 5


still:


1.0


Do not give extra score just because
the user is overqualified.


====================================================================
49. WEIGHTED SKILL MATCH
====================================================================

For project requirements:


skillContribution =

skillMatch * importance


Then:


totalSkillScore =

sum(skillContribution) /
sum(importance)


Example:


Java:

1.0 * 1.0 = 1.0


Spring Boot:

0.75 * 1.0 = 0.75


SQL:

1.0 * 0.7 = 0.7


Total:


(1.0 + 0.75 + 0.7) /
(1.0 + 1.0 + 0.7)


= 90.7%


====================================================================
50. OTHER MATCHING FACTORS
====================================================================

Skill match should be the strongest factor.


Example:


Skill Match = 60%

Role Match = 15%

Career Interest = 10%

Experience = 10%

Availability = 5%


Final:


matchScore =

skillMatch * 0.60

+

roleMatch * 0.15

+

careerInterest * 0.10

+

experience * 0.10

+

availability * 0.05


====================================================================
51. PROJECT -> USER MATCHING
====================================================================

Project owner asks:


"Who would be good for this project?"


System:


1. Find users with required skills.

2. Calculate skill match.

3. Calculate role match.

4. Calculate other factors.

5. Calculate final score.

6. Sort descending.

7. Return top candidates.


Example:


Alex = 94%

Ryan = 88%

John = 81%


====================================================================
52. USER -> PROJECT MATCHING
====================================================================

User asks:


"What projects fit me?"


System performs the same calculation
in reverse.


Example:


E-Commerce = 91%

Education App = 87%

Portfolio Platform = 80%


====================================================================
53. HUMAN CONTROL IN SKILL EXCHANGE
====================================================================

The algorithm only recommends.


It NEVER:


Automatically adds users

Automatically creates teams

Automatically accepts applications


Instead:


Recommendation

      ↓

Apply / Invite

      ↓

Human Decision

      ↓

Accept / Reject

      ↓

Team


====================================================================
54. PROFILE SYSTEM
====================================================================

User profile should show:


Name

Career Goal

Skills

Skill Levels

Completed Courses

Certificates

Badges

Projects

Skill Exchange activity


Example:


Career Goal:

Backend Developer


Skills:


Java
Intermediate


Spring Boot
Intermediate


SQL
Intermediate


REST API
Beginner


====================================================================
55. MAIN DASHBOARD
====================================================================

Dashboard should summarize:


Career Goal

Roadmap Progress

Continue Learning

Skill Progress

Recommended Courses

Skill Exchange Matches


Primary CTA:


[ Continue Learning ]


Secondary:


[ Continue Roadmap ]


====================================================================
56. MAIN NAVIGATION
====================================================================

ROADMAP

"My career journey"


MY LEARNING

"My current learning"


COURSES

"Everything I can learn"


SKILL EXCHANGE

"People and projects"


====================================================================
57. ROADMAP VS MY LEARNING
====================================================================

ROADMAP:


Focus:

Career destination

Skill gaps

Learning sequence


MY LEARNING:


Focus:

Current courses

Completed courses

Learning progress


Do not duplicate the same information unnecessarily.


====================================================================
58. COURSES PAGE
====================================================================

Contains:


Search

Filter

Category

Difficulty

Skill

Duration


Example:


Search:

Spring Boot


Results:


Spring Boot Fundamentals

Spring Boot Advanced

Spring Data JPA


====================================================================
59. COURSE ACCESS LOGIC
====================================================================

General Courses page:


User can browse all courses.


Roadmap:


Only recommended courses appear
in the personalized learning sequence.


Locked course:


User can see the course.


But:


Cannot start it if required prerequisites
are not completed.


====================================================================
60. ADMIN COURSE CREATION
====================================================================

Admin creates:


Course


Then defines:


Course skills

Skill target levels

Difficulty

Prerequisites


Then creates:


Lessons


Then:


Quiz questions

Final assessment questions


Therefore the recommendation system
has structured data to work with.


====================================================================
61. IMPORTANT: COURSE QUALITY
====================================================================

The system should NOT rely on AI to generate
all course content automatically.


Courses should be curated/created by admin.


AI helps the student understand
the existing lesson content.


This keeps learning content controlled.


====================================================================
62. ROADMAP EXPLAINABILITY
====================================================================

Every recommended course should have
a reason.


Example:


"Recommended because:"


Your Spring Boot level:

Beginner


Required level:

Advanced


Skill gap:

3 levels


Career importance:

Very High


This course helps improve:

Spring Boot

REST API


Prerequisite:

Java Fundamentals


This makes the recommendation explainable.


====================================================================
63. RECOMMENDATION ENGINE SUMMARY
====================================================================

The recommendation engine works as:


CAREER

    ↓

Required Skills

    ↓

User Skills

    ↓

Skill Gap

    ↓

Priority

    ↓

Relevant Courses

    ↓

Prerequisite Check

    ↓

Course Ranking

    ↓

Roadmap Ordering

    ↓

Personalized Roadmap


====================================================================
64. WHAT AI DOES NOT DO
====================================================================

AI should NOT decide:


"Your career is Backend Developer."


AI should NOT decide:


"You need this course."


AI should NOT decide:


"You passed the exam."


AI should NOT decide:


"You earned this certificate."


AI should NOT decide:


"This person should join your team."


These are application decisions.


====================================================================
65. WHAT AI DOES
====================================================================

AI helps:


"Explain this concept."


"Explain this code."


"Simplify this."


"Summarize this lesson."


"Give me an example."


"Help me understand this lesson."


Therefore:


ALGORITHM = DECISION SUPPORT


AI = LEARNING SUPPORT


====================================================================
66. FULL TECHNICAL FLOW
====================================================================

USER

 ↓

React Frontend

 ↓

Spring Boot REST API

 ↓

Authentication / Authorization

 ↓

Business Logic

 ↓

PostgreSQL


For roadmap:


React

 ↓

POST /roadmap/generate

 ↓

RoadmapService

 ↓

CareerService

 ↓

SkillService

 ↓

SkillGapService

 ↓

CourseRecommendationService

 ↓

PrerequisiteService

 ↓

RoadmapOrderingService

 ↓

PostgreSQL

 ↓

Personalized Roadmap

 ↓

React


====================================================================
67. AI TECHNICAL FLOW
====================================================================

React Lesson Page

 ↓

User clicks:

"Explain"


 ↓

POST /ai/assist


 ↓

AIController


 ↓

AIService


 ↓

CourseService

LessonService


 ↓

Context Builder


 ↓

AI Provider


 ↓

Response


 ↓

React


====================================================================
68. ASSESSMENT TECHNICAL FLOW
====================================================================

User starts assessment

 ↓

AssessmentController

 ↓

Retrieve questions

 ↓

User submits answers

 ↓

AssessmentService

 ↓

Score answers

 ↓

Map results to skills

 ↓

Update assessment attempt

 ↓

Update skill evidence

 ↓

Return result


====================================================================
69. COURSE COMPLETION TECHNICAL FLOW
====================================================================

Lesson completed

 ↓

LessonProgress updated

 ↓

Calculate course progress

 ↓

If all required lessons completed

 ↓

Allow final assessment

 ↓

Final assessment passed

 ↓

Course completed

 ↓

Generate badge

 ↓

Generate certificate

 ↓

Update skill evidence

 ↓

Recalculate future roadmap if needed


====================================================================
70. ROADMAP REGENERATION
====================================================================

If user completes a course:


NEW SKILL EVIDENCE

        ↓

UPDATE USER SKILL

        ↓

RECALCULATE REMAINING SKILL GAPS

        ↓

CHECK REMAINING COURSES

        ↓

UPDATE FUTURE ROADMAP


Do NOT rebuild completed history.

Only adjust future learning.


====================================================================
71. EXAMPLE COMPLETE USER
====================================================================

USER:

Student A


CAREER:

Backend Developer


INITIAL SKILLS:


Java = 3

Spring Boot = 1

REST API = 1

SQL = 2


CAREER REQUIREMENTS:


Java = 4

Spring Boot = 4

REST API = 4

SQL = 3


GAPS:


Java = 1

Spring Boot = 3

REST API = 3

SQL = 1


PRIORITY:


Spring Boot

REST API

Java

SQL


COURSES:


Spring Boot Fundamentals

REST API with Spring Boot

Spring Data JPA

Spring Security


ROADMAP:


1. Spring Boot Fundamentals

2. REST API with Spring Boot

3. Spring Data JPA

4. Spring Security


USER COMPLETES:


Spring Boot Fundamentals


FINAL SCORE:


87%


SKILL UPDATE:


Spring Boot:

1 → 2


ROADMAP:


Next:

REST API with Spring Boot


USER OPENS LESSON:


REST Controllers


User selects:


"What does this code do?"


AI receives:


Course ID

Lesson ID

Selected Code

User Request


AI explains the code.


USER COMPLETES COURSE.


Certificate generated.


Skill profile updated.


Later:


User joins Skill Exchange.


A project requires:


Java

Spring Boot

SQL

REST API


Matching algorithm calculates:


User match = 88%


User sees:


"E-Commerce Platform — 88% Match"


User applies.


Project owner accepts.


User becomes a project member.


====================================================================
72. UI INFORMATION ARCHITECTURE
====================================================================

ONBOARDING


"What are you looking for?"


       +------------------+------------------+

       |                                     |

       v                                     v


FIND MY CAREER                     I KNOW MY CAREER


       |                                     |

       v                                     v


QUESTIONS                            SELECT CAREER


       |                                     |

       v                                     |

CAREER MATCHES                            |


       |                                     |

       +-------------------+-----------------+

                           |

                           v

                     CAREER DETAIL

                           |

                           v

                    SKILL ASSESSMENT

                           |

                           v

                   PERSONALIZED ROADMAP


====================================================================
73. MAIN UI
====================================================================

NAVIGATION:


Roadmap

My Learning

Courses

Skill Exchange


DASHBOARD:


Career Goal

Roadmap Progress

Continue Learning

Skill Progress

Recommended Course

Skill Exchange Matches


====================================================================
74. ROADMAP UI
====================================================================

Show vertical journey:


START

 ↓

✓ Completed Course

 ↓

● Current Course

 ↓

🔒 Locked Course

 ↓

🔒 Locked Course

 ↓

🎯 Career Goal


Every course:

Name

Difficulty

Duration

Skills

Progress

Status

Why recommended?


====================================================================
75. MY LEARNING UI
====================================================================

Tabs:


MY COURSES


In Progress

Completed


MY ROADMAP


Learning Progress

Current Course

Upcoming Courses

Skill Progress


====================================================================
76. COURSE UI
====================================================================

Course page:


Course information

Skills

Lessons

Progress

Quizzes

Assessment

Certificate requirements


Lesson page:


Lesson content

Code examples

Exercises

AI Assistant


====================================================================
77. SKILL EXCHANGE UI
====================================================================

Tabs/sections:


Find Projects

Find Teammates

My Applications

My Invitations

My Projects


Project card:


Title

Match %

Required Skills

Open Roles

Team Size


Teammate card:


Name

Match %

Skills

Role

[ Invite ]


====================================================================
78. EMPTY STATES
====================================================================

If no courses:


"You're ready to start learning."


[ Explore Courses ]


If no project matches:


"No projects match your current skills yet."


[ Explore Projects ]


If no teammates:


"We couldn't find a strong match yet."


[ Explore More ]


====================================================================
79. SECURITY RULES
====================================================================

All protected actions require authentication.


Backend must verify:


User identity

Course access

Assessment ownership

Certificate ownership

Project permissions


Never trust frontend values for:


Score

Completion

Certificate eligibility

Skill level

Project membership


All important decisions must be verified
on the backend.


====================================================================
80. IMPORTANT DESIGN PRINCIPLE
====================================================================

The frontend displays the result.

The backend calculates the result.


For example:


Frontend says:

"Generate Roadmap"


Backend actually performs:


Career requirements

+

User skills

+

Skill gaps

+

Course relationships

+

Prerequisites

+

Recommendation scores


Then returns:


Personalized Roadmap


This prevents users from manipulating
important system decisions.


====================================================================
81. SYSTEM SEPARATION
====================================================================

SEPARATE THESE THREE THINGS:


1. CAREER RECOMMENDATION


"Which career might suit me?"


2. ROADMAP RECOMMENDATION


"What should I learn to reach my career goal?"


3. AI LEARNING ASSISTANCE


"Help me understand what I'm learning."


They are different systems.


Career Recommendation
≠
Roadmap Recommendation
≠
AI Tutor


====================================================================
82. ALGORITHM SUMMARY
====================================================================

CAREER DISCOVERY:


answers

 ↓

weighted career scores

 ↓

normalized percentage

 ↓

top careers


SKILL ASSESSMENT:


answers

 ↓

skill evidence

 ↓

skill levels


SKILL GAP:


career requirements

-

user skills

 ↓

skill gaps


ROADMAP:


skill gaps

+

importance

+

courses

+

prerequisites

+

difficulty

 ↓

course ranking

 ↓

dependency ordering

 ↓

roadmap


LEARNING:


lessons

 ↓

progress

 ↓

assessment

 ↓

completion


SKILL UPDATE:


assessment evidence

+

course evidence

+

project evidence

 ↓

updated skill profile


SKILL EXCHANGE:


user skills

+

project requirements

 ↓

match score

 ↓

recommendations

 ↓

human decision


AI:


lesson context

+

user request

 ↓

AI explanation


====================================================================
83. DEVELOPMENT PRIORITY
====================================================================

Build in this order:


PHASE 1:

Authentication

User Profile

Skill System


PHASE 2:

Career Database

Career Discovery

Career Selection


PHASE 3:

Skill Assessment

Skill Scoring

Skill Gap Analysis


PHASE 4:

Course Database

Course-Skill Mapping

Prerequisites


PHASE 5:

Roadmap Algorithm

Course Recommendation

Roadmap UI


PHASE 6:

Course Learning

Lessons

Progress

Quizzes


PHASE 7:

Final Assessment

Certificate

Badge

Skill Updates


PHASE 8:

AI Learning Assistant


PHASE 9:

Skill Exchange

Projects

Matching

Applications

Invitations


====================================================================
84. MVP PRINCIPLE
====================================================================

Do not implement every advanced feature immediately.


The minimum viable complete journey is:


Career Selection

        ↓

Skill Assessment

        ↓

Skill Gap

        ↓

Personalized Roadmap

        ↓

Reading Course

        ↓

Progress

        ↓

Final Assessment

        ↓

Certificate


Then:


AI Assistant


Then:


Skill Exchange


====================================================================
85. FINAL SYSTEM PHILOSOPHY
====================================================================

The platform should be:


PERSONALIZED

because every roadmap is based on the user's
current skills and career goal.


EXPLAINABLE

because every recommendation has a reason.


SKILL-BASED

because careers, courses, assessments,
and projects are connected through skills.


AI-ASSISTED

because AI helps students understand lessons.


NOT AI-DEPENDENT

because core decisions are controlled
by deterministic algorithms and backend logic.


ASSESSMENT-DRIVEN

because the system verifies understanding.


PROGRESSIVE

because the roadmap changes as the user's
skills improve.


HUMAN-CONTROLLED

because career choices and team decisions
remain with the user.


====================================================================
FINAL ARCHITECTURE
====================================================================


                       USER
                         |
                         v
                  REACT FRONTEND
                         |
                         v
                SPRING BOOT BACKEND
                         |
        +----------------+----------------+
        |                |                |
        v                v                v
    PostgreSQL       Recommendation     AI Service
        |                Engine             |
        |                |                  |
        |        +-------+-------+          |
        |        |       |       |          |
        |        v       v       v          v
        |     Career   Roadmap Course    AI Provider
        |     Match    Engine   Match
        |
        +------------------------------------------------+
        |              |              |                  |
        v              v              v                  v
      Users          Careers        Courses          Projects
        |              |              |                  |
        |              |              |                  |
        +--------------+--------------+------------------+
                               |
                               v
                         SKILL SYSTEM
                               |
             +-----------------+----------------+
             |                 |                |
             v                 v                v
       Career Skills     User Skills      Course Skills
             |                 |                |
             +-----------------+----------------+
                               |
                               v
                         SKILL GAP ENGINE
                               |
                               v
                      COURSE RECOMMENDER
                               |
                               v
                      ROADMAP GENERATOR
                               |
                               v
                           LEARNING
                               |
                               v
                          ASSESSMENT
                               |
                               v
                        SKILL EVIDENCE
                               |
                               v
                       SKILL EXCHANGE
                               |
                               v
                         MATCH ENGINE
                               |
                               v
                      HUMAN DECISION


====================================================================
END
====================================================================