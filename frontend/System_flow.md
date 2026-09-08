# ============================================================
# SKILLHUB - COMPLETE SYSTEM WORKFLOW AND ROLE FEATURES
# ============================================================

## 1. SYSTEM OVERVIEW

SkillHub is a personalized career guidance and learning platform.

The system helps students:

- Discover a suitable career.
- Select a career if they already know their career goal.
- Assess their current knowledge and skills.
- Identify missing skills for their target career.
- Generate a personalized learning roadmap.
- Learn through roadmap phases.
- Find suitable courses for each phase.
- Receive a recommended course based on multiple criteria.
- Learn through lessons.
- Use an AI Assistant while learning.
- Complete quizzes and assignments.
- Track learning progress.
- Rate and review courses.
- Earn certificates and badges.
- Find learning partners through Skill Exchange.

The system has three main roles:

1. STUDENT
2. INSTRUCTOR
3. ADMIN


# ============================================================
# 2. SYSTEM ROLES
# ============================================================


## 2.1 STUDENT ROLE

The Student is the main learner of the platform.
Students use SkillHub to discover careers, assess their skills,
follow personalized roadmaps, learn courses, and track progress.


### STUDENT FEATURES

A Student can:

ACCOUNT
- Register as a Student.
- Login.
- Logout.
- Reset password.
- Update profile.
- Upload profile picture.
- Manage personal information.

CAREER DISCOVERY
- Find a suitable career.
- Take a career interest assessment.
- View career recommendations.
- Compare recommended careers.
- Select a career goal.

CAREER SELECTION
- Browse available careers.
- Search careers.
- Select a career directly if they already know their goal.

SKILL ASSESSMENT
- Take skill assessment questions.
- Answer questions related to career skills.
- Receive estimated skill levels.
- View their personal skill profile.

PERSONALIZED ROADMAP
- Receive a personalized roadmap.
- View roadmap phases.
- View current phase.
- View completed phases.
- View locked or upcoming phases.
- View roadmap progress.
- View required skills in each phase.

COURSE DISCOVERY
- View courses related to a roadmap phase.
- Search courses.
- Filter courses.
- View recommended courses.
- View course ratings.
- View course reviews.
- View course difficulty.
- View course information.
- Compare available courses.

LEARNING
- Enroll in a course.
- View course lessons.
- Read learning materials.
- View code examples.
- Complete exercises.
- Mark lessons as completed.
- Continue learning from the last lesson.

AI LEARNING ASSISTANT
- Ask questions about the current lesson.
- Ask for a simple explanation.
- Ask for an example.
- Ask for code explanations.
- Summarize the current lesson.
- Ask for practice questions.
- Ask for hints.
- Ask about incorrect quiz answers.

QUIZZES
- Take quizzes.
- View quiz scores.
- Review correct and incorrect answers.
- Retry quizzes if allowed.
- Ask the AI Assistant for explanations.

ASSIGNMENTS AND PROJECTS
- View assignments.
- Complete assignments.
- Submit assignments if submission is required.
- Complete learning projects.

PROGRESS TRACKING
- View lesson progress.
- View course progress.
- View quiz results.
- View skill progress.
- View roadmap progress.

COURSE REVIEW
- Rate completed courses.
- Write a review.
- Update their own review if allowed.

CERTIFICATES AND BADGES
- Receive certificates after completing eligible courses.
- View certificates.
- View earned badges.
- Display achievements on their profile.

SKILL EXCHANGE
- Browse other students.
- View learning-related profiles.
- Find students with complementary skills.
- Send a connection request.
- Accept or reject connection requests.
- Find learning partners.


# ============================================================
# 3. STUDENT SIGNUP WORKFLOW
# ============================================================

The registration page should first ask:

"How do you want to use SkillHub?"

Options:

- Continue as Student
- Continue as Instructor


If the person selects STUDENT:

Required information:

- Full Name
- Email
- Password
- Confirm Password

Optional information:

- Profile Picture
- Bio
- Education Level
- Interests


After successful registration:

- A user account is created.
- The role is set to STUDENT.
- The Student can login.
- The Student is redirected to the Student Dashboard.


Important:

Students should not require Admin approval to use the platform.


# ============================================================
# 4. STUDENT LOGIN AND DASHBOARD
# ============================================================

All users use the same login page.

Login fields:

- Email
- Password


After successful authentication, the system checks the user's role.


If role = STUDENT:

Redirect to:

Student Dashboard


The Student Dashboard should show:

- Welcome message.
- Target career.
- Current roadmap.
- Overall roadmap progress.
- Current phase.
- Current course.
- Course progress.
- Skill progress.
- Continue Learning button.
- Recommended next course.
- Recent achievements.


# ============================================================
# 5. STUDENT CAREER DISCOVERY WORKFLOW
# ============================================================

When a Student uses the system for the first time,
the system should determine whether they know their career goal.

Show two options:

1. FIND MY CAREER
2. I KNOW MY CAREER


## OPTION 1: FIND MY CAREER

The Student does not know which career is suitable.

The system shows an interactive career discovery assessment.

The questions can focus on:

- Interests.
- Technology preferences.
- Work preferences.
- Problem-solving preferences.
- Types of projects the Student enjoys.
- Basic technical interests.


Example:

Question:

"What type of work sounds most interesting to you?"

Options:

- Designing websites.
- Building backend systems.
- Analyzing data.
- Creating mobile applications.


The system records answers.

After completing the assessment,
the system calculates career compatibility scores.

Example:

Frontend Developer:
86% Match

Full Stack Developer:
75% Match

Java Backend Developer:
65% Match


The Student can:

- View recommended careers.
- Read career descriptions.
- View required skills.
- Select a career.


The selected career becomes the Student's career goal.


## OPTION 2: I KNOW MY CAREER

The Student already knows their target career.

The Student:

- Browses careers.
- Searches for a career.
- Selects a career.

Example:

Java Backend Developer


After selecting the career,
the Student continues to the Skill Assessment.


# ============================================================
# 6. STUDENT SKILL ASSESSMENT
# ============================================================

After a career is selected,
the system determines the Student's current skill levels.

The system shows questions related to skills required by the career.


Example Career:

Java Backend Developer


Required skills:

- Java
- SQL
- Spring Boot
- REST API
- JPA/Hibernate
- Git


The assessment contains questions mapped to these skills.


Example:

Question:

"What is a Java interface?"

Related Skill:

Java


Question:

"What does an SQL JOIN do?"

Related Skill:

SQL


Question:

"What is a REST API?"

Related Skill:

REST API


After the assessment,
the system calculates estimated skill levels.


Example Student Skill Profile:

Java:
75%

SQL:
40%

Spring Boot:
20%

REST API:
10%

Git:
60%


This information is stored in the Student Skill Profile.


# ============================================================
# 7. SKILL GAP ANALYSIS
# ============================================================

The system compares:

Student's current skill level

with

The required skill level for the selected career.


Example:


Skill: Java

Student Level:
75%

Career Required Level:
80%

Skill Gap:
5%


Skill: Spring Boot

Student Level:
20%

Career Required Level:
70%

Skill Gap:
50%


Skill: REST API

Student Level:
10%

Career Required Level:
70%

Skill Gap:
60%


The system identifies which skills the Student needs to learn.


# ============================================================
# 8. PERSONALIZED ROADMAP
# ============================================================

The system generates a roadmap based on:

- Selected career.
- Career required skills.
- Student current skill levels.
- Skill gaps.
- Skill priority.
- Skill dependencies.


The roadmap is divided into PHASES.

A roadmap phase represents a learning stage.


Example:

Career:

Java Backend Developer


PHASE 1:
Programming Foundations

Skills:

- Java
- Object-Oriented Programming


PHASE 2:
Database Fundamentals

Skills:

- SQL


PHASE 3:
Backend Development

Skills:

- Spring Boot


PHASE 4:
API Development

Skills:

- REST API


PHASE 5:
Data Access

Skills:

- JPA/Hibernate


PHASE 6:
Security

Skills:

- Spring Security


PHASE 7:
Deployment

Skills:

- Docker


PHASE 8:
Real-World Project


Important:

The roadmap contains PHASES and SKILLS.

The roadmap does not permanently contain a specific course.


# ============================================================
# 9. ROADMAP PHASE PAGE
# ============================================================

When the Student opens a roadmap phase,
the system displays:

- Phase name.
- Phase description.
- Required skills.
- Student's current skill level.
- Required skill level.
- Skill gap.
- Available courses.


Example:

PHASE 3:
Backend Development


Required Skill:

Spring Boot


Student Level:

20%


Career Requirement:

70%


Available Courses:

- Spring Boot for Beginners
- Complete Spring Boot
- Advanced Spring Boot


The system selects the best suitable course and displays:

RECOMMENDED FOR YOU


The Student can also browse all other available courses.


# ============================================================
# 10. COURSE RECOMMENDATION
# ============================================================

The system does not recommend a course only because
it has the highest rating.

The recommendation system uses multiple criteria.


Recommended criteria:

1. Skill Match

Does the course teach the skill required by the phase?


2. Difficulty Match

Does the course difficulty match the Student's current skill level?


3. Course Rating

Higher-rated courses receive a better score.


4. Number of Ratings

A rating from 1,000 students is generally more reliable
than a rating from 2 students.


5. Course Completion Rate

Courses that students successfully complete may receive
a better recommendation score.


6. Course Quality

The system can consider:

- Complete course description.
- Clear learning objectives.
- Number of lessons.
- Quiz availability.
- Assignment availability.


7. Course Freshness

Recently updated courses may receive a better score.


Example:


Student:

Spring Boot Level = 20%


Available Courses:


Spring Boot for Beginners

Rating:
4.8

Difficulty:
Beginner

Reviews:
1,000


Advanced Spring Boot

Rating:
4.9

Difficulty:
Advanced

Reviews:
50


Recommended Course:

Spring Boot for Beginners


Reason:

It matches the Student's current skill level,
teaches the required skill,
has a strong rating,
and has many student reviews.


# ============================================================
# 11. COURSE ENROLLMENT
# ============================================================

The Student selects:

START COURSE


The system creates a course enrollment.

The course appears in:

My Learning


The Student can:

- Open the course.
- Continue learning.
- View progress.
- Complete lessons.


Course enrollment statuses can include:

NOT_STARTED

IN_PROGRESS

COMPLETED


# ============================================================
# 12. COURSE LEARNING WORKFLOW
# ============================================================

A course contains learning content.


Example Course:

Spring Boot for Beginners


Course content:

Lesson 1:
Introduction to Spring Boot

Lesson 2:
Dependency Injection

Lesson 3:
Controllers

Lesson 4:
REST APIs

Lesson 5:
Database Integration

Quiz

Assignment


The Student completes content step by step.


# ============================================================
# 13. LESSON PAGE
# ============================================================

The Lesson Page is where the Student learns.

The page can contain:

- Lesson title.
- Text content.
- Explanations.
- Images.
- Code examples.
- Exercises.
- Learning resources.


The Student can:

- Read the lesson.
- Study examples.
- Complete exercises.
- Ask the AI Assistant for help.
- Mark the lesson as completed.


# ============================================================
# 14. AI ASSISTANT INSIDE LESSONS
# ============================================================

The AI Assistant is an important learning feature.

The AI Assistant should be available directly inside
the Lesson Page.

The Student should not need to leave the lesson
to ask for help.


The AI Assistant can perform the following actions:


## EXPLAIN A CONCEPT

Student asks:

"What is Dependency Injection?"


The AI gives:

- A simple explanation.
- A detailed explanation if requested.
- An analogy.
- An example.


## SUMMARIZE A LESSON

The Student clicks:

SUMMARIZE


The AI summarizes the current lesson.


Example:

The current lesson is about Dependency Injection.


The AI creates:

- Key points.
- Important concepts.
- Short summary.


## EXPLAIN SELECTED TEXT

The Student highlights part of the lesson.

Example:

"Spring automatically injects required dependencies."


The Student clicks:

EXPLAIN


The AI explains the selected content.


## EXPLAIN CODE

The Student selects a code block.

Example:

@Service
public class UserService {
}


The Student asks:

"Explain this code."


The AI explains:

- What @Service means.
- What the class does.
- Why it is used.


## GENERATE EXAMPLES

Student asks:

"Give me another example."


The AI generates an additional educational example.


## PRACTICE QUESTIONS

Student clicks:

PRACTICE ME


The AI generates practice questions based on
the current lesson.


## GIVE HINTS

Student is solving an exercise.

The Student asks:

"Give me a hint."


The AI should provide guidance instead of immediately
providing the complete answer.


## QUIZ EXPLANATION

After answering a quiz question incorrectly,
the Student can ask:

"Why is my answer wrong?"


The AI explains:

- Why the selected answer is incorrect.
- Why the correct answer is correct.
- The related concept.


# ============================================================
# 15. AI ASSISTANT CONTEXT
# ============================================================

The AI Assistant should know the current learning context.

When the Student is inside a lesson,
the AI should receive information such as:

- Current course.
- Current lesson.
- Current lesson content.
- Selected text, if available.
- Student question.


Example:

Current Course:

Spring Boot for Beginners


Current Lesson:

Dependency Injection


Student Question:

"Explain this concept."


Because the AI knows the current lesson,
it can give a relevant answer.


# ============================================================
# 16. QUIZ SYSTEM
# ============================================================

Courses can contain quizzes.

Question types can include:

- Multiple choice.
- Multiple selection.
- True/False.
- Scenario questions.
- Code-related questions.


The Student:

- Starts the quiz.
- Answers questions.
- Submits the quiz.
- Receives a score.
- Views correct answers.
- Views incorrect answers.


Example:

Score:

8/10

80%


Quiz status:

PASSED


If the Student fails,
they can retry if the Instructor allows retries.


# ============================================================
# 17. ASSIGNMENTS AND PROJECTS
# ============================================================

An Instructor can include assignments
or projects inside a course.

Example Assignment:

Create a simple REST API using Spring Boot.


Example Project:

Build a Student Management System.


The Student can:

- View assignment requirements.
- Complete the assignment.
- Submit the assignment if submission is required.
- View results.


Assignment and project results can contribute
to the Student's skill progress.


# ============================================================
# 18. COURSE PROGRESS
# ============================================================

The system tracks course progress.

Example:


Total Lessons:

10


Completed Lessons:

7


Course Progress:

70%


The Student can:

- Continue from the last lesson.
- View completed lessons.
- View remaining lessons.


When all required content is completed,
the course status becomes:

COMPLETED


# ============================================================
# 19. COURSE RATING AND REVIEW
# ============================================================

After completing a course,
the Student can rate and review it.


Example:

Rating:

1 to 5 stars


Review:

"This course explained Spring Boot very clearly."


Recommended business rules:

- Only enrolled Students can review a course.
- Preferably, only Students who completed the course
  can rate and review it.
- One Student should only have one review per course.
- The Student can edit their own review.


The system calculates:

Average Course Rating


Example:

Average:

4.7 / 5


Number of Ratings:

1,250


Both rating and number of ratings should be visible.


# ============================================================
# 20. STUDENT SKILL PROGRESS
# ============================================================

Student skill levels should update over time.

Skill progress can be affected by:

- Initial assessment.
- Course completion.
- Quiz scores.
- Assignment results.
- Project results.


Example:


Initial Spring Boot Level:

20%


After Course:

45%


After Quiz:

55%


After Assignment:

70%


Updated Skill Level:

70%


The system stores updated skill progress.


# ============================================================
# 21. ROADMAP PROGRESS
# ============================================================

The roadmap updates as the Student learns.


Example:

Phase 1:
COMPLETED


Phase 2:
COMPLETED


Phase 3:
IN PROGRESS


Phase 4:
LOCKED or NOT STARTED


When required skills for a phase reach the target level,
the phase can be marked:

COMPLETED


The next phase becomes available.


# ============================================================
# 22. COURSE COMPLETION
# ============================================================

A course can be considered completed when
the required content is completed.


Example requirements:

- All required lessons completed.
- Required quiz passed.
- Required assignment completed.


After completion:

- Course status becomes COMPLETED.
- Course progress becomes 100%.
- Student can rate the course.
- Skill progress is updated.
- Roadmap progress is updated.
- Certificate may be generated.
- The system can recommend the next learning step.


# ============================================================
# 23. STUDENT CERTIFICATES
# ============================================================

Eligible completed courses can provide certificates.

A certificate can contain:

- Student name.
- Course name.
- Instructor name.
- Completion date.
- Certificate ID.


The Student can:

- View certificates.
- Download certificates.
- Display achievements on their profile.


# ============================================================
# 24. STUDENT BADGES
# ============================================================

Students can earn badges based on achievements.

Examples:

- First Course Completed.
- Java Beginner.
- SQL Explorer.
- Backend Explorer.
- Quiz Master.
- Roadmap Progress Champion.


Badges can be displayed on the Student Profile.


# ============================================================
# 25. SKILL EXCHANGE
# ============================================================

Skill Exchange helps Students find learning partners.

Example:


Student A:

Strong Skill:

Java


Needs Help:

React


Student B:

Strong Skill:

React


Needs Help:

Java


The system can suggest that they connect.


Student features:

- Browse potential learning partners.
- Search by skill.
- View skill interests.
- Send connection requests.
- Accept requests.
- Reject requests.
- Find people to learn with.


# ============================================================
# 26. COMPLETE STUDENT WORKFLOW
# ============================================================

STEP 1:
Student registers.

STEP 2:
Student selects the STUDENT role.

STEP 3:
Student creates an account.

STEP 4:
Student logs in.

STEP 5:
System redirects the Student to the Student Dashboard.

STEP 6:
Student chooses:

- Find My Career
OR
- I Know My Career

STEP 7:
Student selects or discovers a career.

STEP 8:
Student takes a skill assessment.

STEP 9:
System creates a Student Skill Profile.

STEP 10:
System compares Student skills with Career requirements.

STEP 11:
System identifies Skill Gaps.

STEP 12:
System generates a Personalized Roadmap.

STEP 13:
Student opens a Roadmap Phase.

STEP 14:
System displays required skills and available courses.

STEP 15:
System ranks available courses.

STEP 16:
The best suitable course receives the
RECOMMENDED FOR YOU label.

STEP 17:
Student enrolls in a course.

STEP 18:
Student studies lessons.

STEP 19:
Student uses the AI Assistant when needed.

STEP 20:
Student completes quizzes.

STEP 21:
Student completes assignments or projects.

STEP 22:
Student completes the course.

STEP 23:
Student rates and reviews the course.

STEP 24:
System updates Student Skill Progress.

STEP 25:
System updates Roadmap Progress.

STEP 26:
System recommends the next learning step.

STEP 27:
The process continues until the Student completes
the career roadmap.


# ============================================================
# 27. INSTRUCTOR ROLE
# ============================================================

The Instructor creates and manages learning content.

The Instructor does not manage:

- Global Skills.
- Careers.
- Student accounts.
- Course approval decisions.


The Instructor manages their own courses.


# ============================================================
# 28. INSTRUCTOR FEATURES
# ============================================================

ACCOUNT
- Register as an Instructor.
- Login.
- Logout.
- Reset password.
- Update Instructor profile.
- Update biography.
- Update professional information.
- Add expertise.
- Add portfolio or LinkedIn link.
- Upload profile picture.


COURSE MANAGEMENT
- Create courses.
- Save courses as drafts.
- Edit courses.
- Delete courses if allowed.
- Submit courses for approval.
- View course approval status.
- Edit rejected courses.
- Resubmit rejected courses.
- Manage published courses.


COURSE CONTENT
- Add course title.
- Add description.
- Add thumbnail.
- Add difficulty level.
- Add estimated duration.
- Add learning objectives.
- Add lessons.
- Add quizzes.
- Add assignments.
- Add projects.


SKILL MAPPING
- Select skills from the existing Skill Library.
- Map courses to one or more skills.


Example:

Course:

Spring Boot for Beginners


Mapped Skills:

- Java
- Spring Boot


Important:

The Instructor does not create duplicate global skills.


COURSE ANALYTICS
- View number of enrollments.
- View course completion rate.
- View average rating.
- View student reviews.
- View course performance statistics.


# ============================================================
# 29. INSTRUCTOR SIGNUP
# ============================================================

When registering,
the person selects:

INSTRUCTOR


The Instructor provides basic account information:

- Full Name.
- Email.
- Password.
- Confirm Password.


The Instructor also provides professional information:

- Professional Title.
- Biography.
- Years of Experience.
- Areas of Expertise.
- Education Background.
- Portfolio URL.
- LinkedIn URL.
- Profile Picture.


Example:


Name:

John Smith


Professional Title:

Senior Java Developer


Experience:

5 Years


Expertise:

- Java
- Spring Boot
- REST API


After registration:

Role:

INSTRUCTOR


The person can login and access
the Instructor Dashboard.


Important:

Creating an Instructor account does not automatically
publish any courses.


# ============================================================
# 30. INSTRUCTOR LOGIN AND DASHBOARD
# ============================================================

The Instructor uses the same login page
as Students and Admins.


After login:

The system checks the user's role.


If the role is INSTRUCTOR:

Redirect to:

Instructor Dashboard


The dashboard can show:

- Total Courses.
- Draft Courses.
- Pending Approval Courses.
- Published Courses.
- Rejected Courses.
- Total Enrollments.
- Average Course Rating.
- Recent Reviews.


Main actions:

- Create Course.
- Manage Courses.
- View Reviews.
- View Analytics.
- Manage Profile.


# ============================================================
# 31. INSTRUCTOR COURSE CREATION
# ============================================================

The Instructor selects:

CREATE COURSE


The Instructor enters:


BASIC INFORMATION

- Course Title.
- Short Description.
- Full Description.
- Course Thumbnail.
- Difficulty Level.
- Estimated Duration.


LEARNING INFORMATION

- Learning Objectives.
- Prerequisites.
- Skills Taught.


CONTENT

- Lessons.
- Quizzes.
- Assignments.
- Projects.


Example:


Course Title:

Java Programming for Beginners


Difficulty:

BEGINNER


Skills Taught:

Java


Learning Objectives:

- Understand Java basics.
- Write Java programs.
- Understand Object-Oriented Programming.


# ============================================================
# 32. INSTRUCTOR SKILL SELECTION
# ============================================================

When creating a course,
the Instructor selects skills from the Skill Library.


Example Skill Library:

- Java
- SQL
- Spring Boot
- REST API
- Git


The Instructor selects:

Java


Course:

Java Programming for Beginners


The system stores:

Course teaches Java.


Another Instructor can create:

Advanced Java Programming


And also select:

Java


Both courses teach the same skill.

The difference is the course difficulty and content.


Example:


Java Programming for Beginners

Skill:

Java

Difficulty:

BEGINNER


Advanced Java Programming

Skill:

Java

Difficulty:

ADVANCED


The Skill is not duplicated.


# ============================================================
# 33. INSTRUCTOR COURSE STATUS
# ============================================================

Every course has a status.


DRAFT

The Instructor is still creating or editing the course.

Students cannot see it.


PENDING_APPROVAL

The Instructor has submitted the course.

Admin needs to review it.

Students cannot see it.


PUBLISHED

The Admin approved the course.

Students can see it.

The course can:

- Appear in course search.
- Be enrolled by Students.
- Appear in roadmap phases.
- Be considered by the recommendation system.
- Receive ratings and reviews.


REJECTED

The Admin rejected the course.

The Instructor can view the rejection reason.

The Instructor can edit the course and submit it again.


ARCHIVED

The course is no longer actively available.


# ============================================================
# 34. INSTRUCTOR COURSE WORKFLOW
# ============================================================

STEP 1:
Instructor logs in.

STEP 2:
Instructor opens the Instructor Dashboard.

STEP 3:
Instructor selects Create Course.

STEP 4:
Instructor enters course information.

STEP 5:
Instructor selects existing skills.

STEP 6:
Instructor sets course difficulty.

STEP 7:
Instructor creates lessons.

STEP 8:
Instructor creates quizzes.

STEP 9:
Instructor creates assignments or projects.

STEP 10:
Instructor saves the course as DRAFT.

STEP 11:
Instructor reviews the course.

STEP 12:
Instructor submits the course for approval.

STEP 13:
Course status becomes PENDING_APPROVAL.

STEP 14:
Admin reviews the course.


If Admin approves:

STEP 15:
Course status becomes PUBLISHED.

STEP 16:
The course becomes visible to Students.


If Admin rejects:

STEP 15:
Course status becomes REJECTED.

STEP 16:
Instructor receives the rejection reason.

STEP 17:
Instructor edits the course.

STEP 18:
Instructor submits the course again.

STEP 19:
Course returns to PENDING_APPROVAL.


# ============================================================
# 35. ADMIN ROLE
# ============================================================

The Admin manages the platform structure,
content quality, and system management.


The Admin is responsible for:

- User management.
- Instructor management.
- Skill Library management.
- Career management.
- Assessment management.
- Course approval.
- Course moderation.
- Review moderation.
- Platform statistics.


Admin is the main system management role.


# ============================================================
# 36. ADMIN FEATURES
# ============================================================

USER MANAGEMENT

Admin can:

- View Students.
- View Instructors.
- Search users.
- View user details.
- Suspend accounts if required.
- Activate accounts.
- Manage user status.


INSTRUCTOR MANAGEMENT

Admin can:

- View Instructor profiles.
- Manage Instructor accounts.
- View Instructor courses.
- View Instructor activity.


SKILL LIBRARY MANAGEMENT

Admin can:

- Create Skills.
- Edit Skills.
- Delete Skills if not being used.
- Search Skills.
- Prevent duplicate Skills.


Example Skills:

- Java
- SQL
- Spring Boot
- React
- Python


CAREER MANAGEMENT

Admin can:

- Create Careers.
- Edit Careers.
- Delete Careers if allowed.
- Add career descriptions.
- Define roadmap phases.
- Map required skills to careers.
- Define skill importance.
- Define required skill levels.
- Define skill order or dependencies.


ASSESSMENT MANAGEMENT

Admin can:

- Create Career Discovery Questions.
- Create Skill Assessment Questions.
- Map questions to Skills.
- Define question difficulty.
- Define correct answers.
- Define scoring rules.
- Edit questions.
- Activate or deactivate questions.


COURSE APPROVAL

Admin can:

- View pending courses.
- Open course details.
- Review lessons.
- Review quizzes.
- Review assignments.
- Review selected skills.
- Approve courses.
- Reject courses.
- Provide rejection reasons.


COURSE MODERATION

Admin can:

- View published courses.
- Remove inappropriate courses.
- Archive courses.
- Review reported content.


REVIEW MODERATION

Admin can:

- View course reviews.
- Remove inappropriate reviews if necessary.
- Handle reported reviews.


PLATFORM ANALYTICS

Admin can view:

- Total Students.
- Total Instructors.
- Total Courses.
- Published Courses.
- Pending Courses.
- Course Enrollment Statistics.
- Course Completion Rates.
- Popular Careers.
- Popular Skills.
- Course Ratings.


# ============================================================
# 37. ADMIN LOGIN AND DASHBOARD
# ============================================================

Admin uses the same login system.


After login:

The system checks the role.


If role = ADMIN:

Redirect to:

Admin Dashboard


Admin Dashboard can display:


USER STATISTICS

- Total Students.
- Total Instructors.


COURSE STATISTICS

- Total Courses.
- Draft Courses.
- Pending Courses.
- Published Courses.
- Rejected Courses.


SYSTEM DATA

- Total Careers.
- Total Skills.
- Total Assessments.


IMPORTANT ACTIONS

- Pending Course Approvals.
- Reported Content.
- Reported Reviews.


# ============================================================
# 38. ADMIN COURSE APPROVAL WORKFLOW
# ============================================================

When an Instructor submits a course:

The course status becomes:

PENDING_APPROVAL


The course appears in the Admin Dashboard.


Admin opens the course.


Admin reviews:

- Course title.
- Course description.
- Course difficulty.
- Skills taught.
- Learning objectives.
- Lessons.
- Quiz content.
- Assignments.
- Projects.


Admin then chooses:


APPROVE


OR


REJECT


If approved:

Course status:

PUBLISHED


The course becomes available to Students.


If rejected:

Course status:

REJECTED


Admin provides a reason.


Example:

"Please add more lesson content."


The Instructor sees the rejection reason,
edits the course,
and submits it again.


# ============================================================
# 39. COMPLETE COURSE APPROVAL RULE
# ============================================================

Important rule:


Instructor creates course:

NOT PUBLIC


Instructor submits course:

NOT PUBLIC


Admin reviews course:

NOT PUBLIC


Admin approves course:

PUBLIC


Only approved courses can:

- Be searched by Students.
- Be enrolled in.
- Be displayed in roadmap phases.
- Be recommended.
- Receive ratings.


# ============================================================
# 40. ROLE COMPARISON
# ============================================================


STUDENT

Main purpose:

Learn and follow a career roadmap.


Main actions:

- Discover career.
- Take assessments.
- Follow roadmap.
- Enroll in courses.
- Learn lessons.
- Use AI Assistant.
- Complete quizzes.
- Track progress.
- Rate courses.
- Earn certificates.


------------------------------------------------


INSTRUCTOR

Main purpose:

Create educational content.


Main actions:

- Create courses.
- Create lessons.
- Create quizzes.
- Create assignments.
- Select existing Skills.
- Submit courses.
- Edit rejected courses.
- View reviews.
- View analytics.


------------------------------------------------


ADMIN

Main purpose:

Manage and control the platform.


Main actions:

- Manage users.
- Manage instructors.
- Manage Skills.
- Manage Careers.
- Manage Assessments.
- Approve courses.
- Reject courses.
- Moderate content.
- View system analytics.


# ============================================================
# 41. IMPORTANT ROLE PERMISSIONS
# ============================================================


FEATURE:
Create Global Skill


Student:
NO


Instructor:
NO


Admin:
YES


------------------------------------------------


FEATURE:
Create Career


Student:
NO


Instructor:
NO


Admin:
YES


------------------------------------------------


FEATURE:
Create Course


Student:
NO


Instructor:
YES


Admin:
OPTIONAL


------------------------------------------------


FEATURE:
Approve Course


Student:
NO


Instructor:
NO


Admin:
YES


------------------------------------------------


FEATURE:
Enroll in Course


Student:
YES


Instructor:
NO


Admin:
NO


------------------------------------------------


FEATURE:
Rate Course


Student:
YES

After Completion


Instructor:
NO

For own courses


Admin:
NO


------------------------------------------------


FEATURE:
Use AI Learning Assistant


Student:
YES


Instructor:
Optional

For content preview


Admin:
Optional


------------------------------------------------


FEATURE:
Manage Users


Student:
NO


Instructor:
NO


Admin:
YES


# ============================================================
# 42. IMPORTANT SYSTEM RELATIONSHIPS
# ============================================================

The central Skill Library connects the major parts
of the system.


ADMIN creates:


SKILLS


Skills are connected to:


CAREERS

ASSESSMENTS

COURSES

STUDENT SKILL PROFILES

ROADMAP PHASES


This means:


CAREER

requires

SKILLS


ASSESSMENT

measures

SKILLS


COURSE

teaches

SKILLS


STUDENT

has a level in

SKILLS


ROADMAP PHASE

focuses on

SKILLS


The recommendation system uses these relationships
to recommend suitable courses.


# ============================================================
# 43. COMPLETE SYSTEM WORKFLOW
# ============================================================


ADMIN PREPARES THE SYSTEM

Admin:

- Creates Skills.
- Creates Careers.
- Defines Career Skills.
- Defines Roadmap Phases.
- Creates Assessment Questions.


INSTRUCTOR CREATES LEARNING CONTENT

Instructor:

- Creates Course.
- Selects existing Skills.
- Creates Lessons.
- Creates Quizzes.
- Creates Assignments.
- Submits Course.


ADMIN REVIEWS COURSE

Admin:

- Reviews Course.


If approved:

Course becomes PUBLISHED.


If rejected:

Instructor edits and resubmits.


STUDENT STARTS LEARNING

Student:

- Registers.
- Logs in.
- Selects or discovers a Career.
- Takes Skill Assessment.


SYSTEM PERSONALIZES LEARNING

System:

- Creates Skill Profile.
- Identifies Skill Gaps.
- Generates Roadmap.
- Organizes Roadmap into Phases.


STUDENT SELECTS A PHASE

System:

- Shows required Skills.
- Finds published Courses.
- Ranks Courses.
- Selects the best suitable Course.


STUDENT LEARNS

Student:

- Enrolls in Course.
- Studies Lessons.
- Uses AI Assistant.
- Takes Quizzes.
- Completes Assignments.


SYSTEM TRACKS PROGRESS

System:

- Updates Lesson Progress.
- Updates Course Progress.
- Updates Skill Progress.
- Updates Roadmap Progress.


STUDENT COMPLETES COURSE

Student:

- Receives completion status.
- Can receive Certificate.
- Can earn Badge.
- Rates Course.
- Writes Review.


SYSTEM CONTINUES

System:

- Recalculates Skill Gaps.
- Updates Roadmap.
- Unlocks or activates the next Phase.
- Recommends the next learning step.


# ============================================================
# 44. FINAL CORE PRINCIPLE
# ============================================================

ADMIN builds and controls the platform structure.

INSTRUCTOR creates the learning content.

STUDENT learns and follows a personalized roadmap.


ADMIN

Controls:

- Skills.
- Careers.
- Assessments.
- Course approval.


INSTRUCTOR

Creates:

- Courses.
- Lessons.
- Quizzes.
- Assignments.


STUDENT

Uses:

- Career discovery.
- Skill assessment.
- Personalized roadmap.
- Courses.
- Lessons.
- AI Assistant.
- Quizzes.
- Progress tracking.


The most important connection in the system is:


SKILL


Because:


Careers require Skills.


Assessments measure Skills.


Courses teach Skills.


Students develop Skills.


Roadmap phases organize Skills.


The recommendation system matches:


Student Skill Level

+

Required Skill

+

Course Skill

+

Course Difficulty

+

Course Quality


to select the most suitable course.


# ============================================================
# 45. IMPLEMENTATION NOTES (SHIPPED BEHAVIOR)
# ============================================================

This section documents concrete implementation details added to satisfy
the behaviors described above. It does not change the spec — it records
how specific sections were wired up in the actual codebase.


## 45.1 CHAT NOTIFICATIONS (relates to Section 14 / AI & Instructor Chat)

Students and Instructors can message each other (Course Q&A and General
Mentorship modes). Previously, "new message" alerts only appeared while
the relevant chat widget was already open on screen:

- Student: DualFloatingChat (only mounted on a Course/Lesson page).
- Instructor: InstructorChatInbox (only visible on the Dashboard
  Messages tab).

A global notification layer now runs on every page for logged-in
Students and Instructors:

- Polls the existing conversation-list endpoints
  (GET /api/chat/conversations for Students,
   GET /api/chat/instructor/students for Instructors) every 5 seconds.
- Tracks a "last seen" timestamp per conversation partner in the
  browser (localStorage), so unread state survives page navigation.
- Shows a global toast + notification sound when a genuinely new
  incoming message arrives, unless the user is already on a page with
  its own local chat notification (to avoid double alerts).
- Displays a live unread-count badge on a new "Messages" link in the
  NavBar:
    - Students: Messages -> /chat
    - Instructors: Messages -> /instructor/dashboard?tab=messages
- The badge clears for a conversation once the Student opens it in
  /chat, or the Instructor selects that student in the Messages inbox.

Net effect: a Student is notified when the Instructor replies, and an
Instructor is notified when a Student sends a message, regardless of
which page either of them is currently viewing.


## 45.2 CAREER NAVBAR ENTRY POINT (relates to Section 5)

Section 5 describes the two-choice Career Discovery workflow:
"FIND MY CAREER" vs "I KNOW MY CAREER". This choice screen already
existed as a dedicated page but had no entry point in navigation.

A "Career" tab was added to the Student NavBar, linking directly to
that two-choice page, so Students can always get back to:
- Find My Career (career discovery assessment), or
- I Know My Career (browse/select a career directly).


## 45.3 CERTIFICATE ISSUANCE ROBUSTNESS (relates to Section 22-23)

Certificates are auto-issued when a course reaches 100% lesson
completion. The original flow only marked a lesson complete when the
Student clicked "Next" on that specific lesson, so a Student who
jumped between lessons out of order (e.g. via the sidebar) and then
clicked "Complete Course" could finish without every lesson being
individually recorded as complete — leaving progress under 100% and
no certificate issued. There was also a timing race where the
certificate lookup could run before the completion request had
finished processing.

The "Complete Course & Rate" action now explicitly marks the course
(and every one of its lessons) as complete in a single request, and
the certificate check waits for that request to finish before
looking up the certificate — guaranteeing a certificate is issued and
visible as soon as a Student finishes a course, regardless of the
order lessons were viewed in.


# ============================================================
# END OF SKILLHUB COMPLETE SYSTEM SPECIFICATION
# ============================================================