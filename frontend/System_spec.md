# ============================================================
# SKILLHUB
# COMPLETE SYSTEM WORKFLOW AND SYSTEM REQUIREMENTS
# ============================================================


# ============================================================
# 1. SYSTEM OVERVIEW
# ============================================================

SkillHub is a personalized career guidance and learning platform.

The main purpose of the system is to help students:

1. Discover a suitable career.
2. Select a career if they already know their target career.
3. Assess their current skills.
4. Identify missing skills.
5. Generate a personalized learning roadmap.
6. Learn through structured roadmap phases.
7. Find suitable courses for each required skill.
8. Receive personalized course recommendations.
9. Learn through lessons.
10. Get help from an AI Assistant inside lessons.
11. Complete quizzes and assignments/projects.
12. Track learning and skill progress.
13. Update their roadmap dynamically.
14. Rate and review completed courses.
15. Earn certificates and badges.
16. Connect with other students through Skill Exchange.

The system contains three main user roles:

1. STUDENT / USER
2. INSTRUCTOR
3. ADMIN


# ============================================================
# 2. MAIN SYSTEM CONCEPT
# ============================================================

The system is based on the following principle:

CAREER
    |
    v
REQUIRED SKILLS
    |
    v
ROADMAP PHASES
    |
    v
REQUIRED SKILLS IN EACH PHASE
    |
    v
AVAILABLE COURSES
    |
    v
COURSE RECOMMENDATION
    |
    v
LEARNING
    |
    v
LESSONS + AI ASSISTANT + QUIZZES
    |
    v
SKILL PROGRESS
    |
    v
ROADMAP UPDATE


The roadmap should NOT directly depend on one specific course.

Instead:

ROADMAP tells the student:

"What should I learn?"

Courses provide:

"How can I learn it?"


# ============================================================
# 3. USER ROLES
# ============================================================

The system has three roles.


---------------------------------------------------------------
3.1 STUDENT / USER
---------------------------------------------------------------

A Student is the main learner in the system.

Student can:

- Register as a Student
- Login
- Find a suitable career
- Select a known career
- Take assessments
- View career recommendations
- View their skill profile
- View skill gaps
- Get a personalized roadmap
- View roadmap phases
- View courses inside a phase
- Receive recommended courses
- Enroll in courses
- Learn lessons
- Use the AI Assistant inside lessons
- Take quizzes
- Complete assignments/projects
- Track course progress
- Track skill progress
- Track roadmap progress
- Rate courses
- Review courses
- Receive certificates
- Earn badges
- Use Skill Exchange
- Manage their profile


---------------------------------------------------------------
3.2 INSTRUCTOR
---------------------------------------------------------------

An Instructor creates learning content.

Instructor can:

- Register as an Instructor
- Login
- Manage instructor profile
- Create courses
- Edit courses
- Create course descriptions
- Select skills taught by the course
- Set course difficulty
- Create lessons
- Add learning content
- Create quizzes
- Create assignments/projects
- Save course as draft
- Submit course for admin review
- Edit rejected courses
- Resubmit courses
- View course approval status
- View published courses
- View course statistics
- View student enrollments
- View ratings
- View reviews
- Update course content

IMPORTANT:

Instructor courses are NOT automatically public.

Every course must go through an approval process.

Course workflow:

DRAFT
    |
    v
PENDING REVIEW
    |
    v
ADMIN REVIEW
    |
    +----------------------+
    |                      |
APPROVED                REJECTED
    |                      |
    v                      v
PUBLISHED            INSTRUCTOR EDITS
    |                      |
    |                      v
    |                  RESUBMIT
    |                      |
    +----------------------+
          


---------------------------------------------------------------
3.3 ADMIN
---------------------------------------------------------------

Admin manages the overall system.

Admin can:

- Login
- Access Admin Dashboard
- Manage users
- Manage instructors
- Manage student accounts
- Manage skills
- Create careers
- Edit careers
- Map careers to skills
- Define required skill levels
- Define skill importance
- Manage assessment questions
- Review instructor courses
- Approve courses
- Reject courses
- Manage published courses
- Manage inappropriate content
- Moderate reviews
- View platform statistics
- View course statistics
- Manage system configuration


# ============================================================
# 4. SIGNUP SYSTEM
# ============================================================

The signup system should allow users to choose their account type.

When a new person enters the registration page:

CREATE ACCOUNT

Choose account type:

[ STUDENT / USER ]

[ INSTRUCTOR ]


---------------------------------------------------------------
4.1 STUDENT SIGNUP
---------------------------------------------------------------

If the person selects:

STUDENT / USER

They provide basic information.

Example:

- Full Name
- Email
- Password
- Confirm Password

Optional:

- Profile Image
- Bio
- Education Level
- Interests

After successful registration:

Account Role = STUDENT

Student can immediately access the Student Dashboard.


Student Signup Flow:

SELECT STUDENT
        |
        v
ENTER BASIC INFORMATION
        |
        v
VALIDATE INFORMATION
        |
        v
CREATE ACCOUNT
        |
        v
ROLE = STUDENT
        |
        v
STUDENT DASHBOARD


---------------------------------------------------------------
4.2 INSTRUCTOR SIGNUP
---------------------------------------------------------------

If the person selects:

INSTRUCTOR

The system should request more information.

Because an Instructor will create educational content.

Example required information:

Basic Account Information:

- Full Name
- Email
- Password
- Confirm Password

Instructor Information:

- Professional Title
- Short Biography
- Expertise / Skills
- Years of Experience
- Education Background
- LinkedIn or Portfolio URL (Optional)
- Profile Image (Optional)


Example:

Name:

John Smith

Professional Title:

Java Backend Developer

Years of Experience:

5 Years

Expertise:

Java
Spring Boot
REST API

Bio:

Experienced backend developer specializing in Java and Spring Boot.


After successful registration:

Account Role = INSTRUCTOR

The Instructor can access the Instructor Dashboard.

IMPORTANT:

Instructor registration does NOT mean all future courses
are automatically published.

Every course still requires admin approval.


Instructor Signup Flow:

SELECT INSTRUCTOR
        |
        v
ENTER BASIC ACCOUNT INFORMATION
        |
        v
ENTER INSTRUCTOR DETAILS
        |
        v
VALIDATE INFORMATION
        |
        v
CREATE INSTRUCTOR ACCOUNT
        |
        v
ROLE = INSTRUCTOR
        |
        v
INSTRUCTOR DASHBOARD


# ============================================================
# 5. LOGIN SYSTEM
# ============================================================

The login process should be the same for all roles.

The login page should contain:

Email
Password

[ LOGIN ]


The system should identify the role after authentication.

Example:

User enters:

Email
Password

        |
        v

SYSTEM AUTHENTICATES USER

        |
        v

GET USER ROLE

        |
        +--------------------------+
        |             |            |
        v             v            v

     STUDENT      INSTRUCTOR      ADMIN

        |             |            |
        v             v            v

Student         Instructor       Admin
Dashboard       Dashboard        Dashboard


Therefore:

The login UI is shared.

But the dashboard and permissions depend on the role.


# ============================================================
# 6. ROLE-BASED DASHBOARD
# ============================================================

After login, users are redirected according to their role.


---------------------------------------------------------------
STUDENT
---------------------------------------------------------------

Redirect:

/student/dashboard


Dashboard includes:

- Welcome section
- Career information
- Current roadmap
- Current phase
- Continue learning
- Course progress
- Skill progress
- Recommended course
- Recommended career
- Achievements


---------------------------------------------------------------
INSTRUCTOR
---------------------------------------------------------------

Redirect:

/instructor/dashboard


Dashboard includes:

- My Courses
- Create Course
- Course Status
- Pending Courses
- Published Courses
- Rejected Courses
- Student Enrollments
- Course Ratings
- Reviews
- Course Statistics


---------------------------------------------------------------
ADMIN
---------------------------------------------------------------

Redirect:

/admin/dashboard


Dashboard includes:

- Total Students
- Total Instructors
- Total Courses
- Pending Course Approvals
- Published Courses
- Total Careers
- Total Skills
- Recent Registrations
- Course Statistics
- Platform Statistics


# ============================================================
# 7. AUTHORIZATION SYSTEM
# ============================================================

The backend must control access based on user roles.

Example:

STUDENT can access:

/student/*


INSTRUCTOR can access:

/instructor/*


ADMIN can access:

/admin/*


Example:

A Student attempts:

POST /admin/careers

Result:

ACCESS DENIED


Example:

An Instructor attempts:

DELETE /admin/users

Result:

ACCESS DENIED


Role checks must happen on the backend.

Frontend role checks are not enough.


# ============================================================
# 8. SKILL LIBRARY
# ============================================================

The Skill Library is the central knowledge structure
of the system.

Skills should be shared across:

- Careers
- Courses
- Assessments
- Student Skill Profiles
- Roadmap Phases


Example Skill Library:

Java
SQL
Spring Boot
REST API
Git
Docker
JPA/Hibernate
Spring Security
HTML
CSS
JavaScript
React
Python


Admin manages the Skill Library.


---------------------------------------------------------------
IMPORTANT RULE
---------------------------------------------------------------

Skills should not be duplicated.

BAD:

Java Basic
Java Intermediate
Java Advanced


GOOD:

Skill:

Java


Courses can have different difficulty levels:

Java for Beginners
    Difficulty = BEGINNER

Java Programming
    Difficulty = INTERMEDIATE

Advanced Java
    Difficulty = ADVANCED


All courses can teach:

Java


# ============================================================
# 9. CAREER MANAGEMENT
# ============================================================

Admin creates careers.

Example careers:

- Java Backend Developer
- Frontend Developer
- Full Stack Developer
- Data Analyst
- Mobile Developer


Example:

Career:

Java Backend Developer


Admin selects existing skills.

Example:

Java
SQL
Spring Boot
REST API
JPA/Hibernate
Spring Security
Git
Docker


Each Career-Skill relationship should contain:

- Required Level
- Importance
- Priority


Example:

Java

Required Level = 80
Importance = HIGH


SQL

Required Level = 70
Importance = HIGH


Spring Boot

Required Level = 70
Importance = HIGH


Docker

Required Level = 40
Importance = LOW


Relationship:

CAREER
    |
    v
CAREER_SKILL
    |
    v
SKILL


A career can require many skills.

A skill can belong to many careers.


# ============================================================
# 10. CAREER PHASE STRUCTURE
# ============================================================

A career roadmap should be divided into phases.

Example:

JAVA BACKEND DEVELOPER ROADMAP


PHASE 1

Programming Foundation

Skills:

Java
OOP


PHASE 2

Database Fundamentals

Skills:

SQL


PHASE 3

Backend Framework

Skills:

Spring Boot


PHASE 4

API Development

Skills:

REST API


PHASE 5

Data Access

Skills:

JPA/Hibernate


PHASE 6

Security

Skills:

Spring Security


PHASE 7

Deployment

Skills:

Docker


PHASE 8

Real-World Project

Skills:

Java
Spring Boot
SQL
REST API


The phase describes a learning stage.

The phase does NOT permanently contain a specific course.


# ============================================================
# 11. INSTRUCTOR COURSE CREATION
# ============================================================

Instructor logs in.

        |
        v

INSTRUCTOR DASHBOARD

        |
        v

CREATE COURSE


Instructor enters:

- Course Title
- Course Description
- Course Thumbnail
- Course Difficulty
- Estimated Duration
- Learning Objectives


Example:

Title:

Spring Boot for Beginners


Difficulty:

BEGINNER


Duration:

10 Hours


Learning Objectives:

- Understand Spring Boot
- Create REST APIs
- Use Dependency Injection


# ============================================================
# 12. COURSE SKILL MAPPING
# ============================================================

After creating course information,
Instructor selects existing skills.

Example:

Course:

Spring Boot for Beginners


Select Skills:

[ Java ]

[ Spring Boot ]

[ REST API ]


Instructor selects:

Java
Spring Boot


Relationship:

COURSE
    |
    v
COURSE_SKILL
    |
    v
SKILL


A course can teach multiple skills.

Example:

Spring Boot REST API Development

Teaches:

Spring Boot
REST API
Java


The Instructor does NOT create a new global skill.

Instructor selects skills from the existing Skill Library.


# ============================================================
# 13. COURSE DIFFICULTY
# ============================================================

Every course should have a difficulty level.

Possible values:

BEGINNER

INTERMEDIATE

ADVANCED


Example:

Course:

Java Programming for Beginners

Difficulty:

BEGINNER


Another Course:

Advanced Java Programming

Difficulty:

ADVANCED


Both courses teach:

Java


The recommendation system uses difficulty to recommend
the most suitable course for each student.


# ============================================================
# 14. COURSE CONTENT CREATION
# ============================================================

Instructor creates course content.

Course:

Java Programming for Beginners


Lessons:

Lesson 1:

Introduction to Java


Lesson 2:

Variables and Data Types


Lesson 3:

Conditions


Lesson 4:

Loops


Lesson 5:

Methods


Lesson 6:

Object-Oriented Programming


Lesson 7:

Classes and Objects


Lesson 8:

Inheritance


Lesson 9:

Polymorphism


The Instructor can create:

- Text lessons
- Code examples
- Images
- Exercises
- Learning materials


After lessons:

Instructor creates:

- Quizzes
- Assignments
- Projects


# ============================================================
# 15. COURSE STATUS
# ============================================================

Each course should have a status.

Possible statuses:

DRAFT

PENDING_APPROVAL

PUBLISHED

REJECTED

ARCHIVED


---------------------------------------------------------------
DRAFT
---------------------------------------------------------------

The Instructor is still editing the course.

The course is not visible to students.


---------------------------------------------------------------
PENDING_APPROVAL
---------------------------------------------------------------

Instructor finished the course and submits it.

The course is waiting for Admin review.


---------------------------------------------------------------
PUBLISHED
---------------------------------------------------------------

Admin approves the course.

The course becomes visible to students.

The course can now:

- Appear in search
- Appear inside roadmap phases
- Be recommended by the recommendation system
- Receive enrollments


---------------------------------------------------------------
REJECTED
---------------------------------------------------------------

Admin rejects the course.

The course is not public.

Admin should provide a rejection reason.

Example:

"Please add learning objectives."

or:

"Course content is incomplete."


Instructor can:

Edit Course

        |
        v

Resubmit

        |
        v

PENDING_APPROVAL


# ============================================================
# 16. COURSE APPROVAL WORKFLOW
# ============================================================

INSTRUCTOR

        |
        v

CREATE COURSE

        |
        v

ADD COURSE DETAILS

        |
        v

SELECT SKILLS

        |
        v

CREATE LESSONS

        |
        v

CREATE QUIZZES

        |
        v

ADD ASSIGNMENTS

        |
        v

SAVE DRAFT

        |
        v

SUBMIT COURSE

        |
        v

STATUS:

PENDING_APPROVAL

        |
        v

ADMIN REVIEWS COURSE

        |
        +---------------------------+
        |                           |
        v                           v

     APPROVE                     REJECT

        |                           |
        v                           v

STATUS:                     STATUS:

PUBLISHED                   REJECTED

        |                           |
        v                           v

VISIBLE TO                  INSTRUCTOR
STUDENTS                    EDITS COURSE

                                    |
                                    v

                              RESUBMIT COURSE

                                    |
                                    v

                              PENDING_APPROVAL


# ============================================================
# 17. ADMIN COURSE APPROVAL
# ============================================================

Admin Dashboard should show:

Pending Course Approvals


Example:

Pending Courses:

1. Java Programming for Beginners

Instructor:

John Smith

Status:

PENDING_APPROVAL


Admin opens course.


Admin can review:

- Course title
- Description
- Difficulty
- Selected skills
- Lessons
- Quiz
- Assignment
- Learning objectives


Admin actions:

[ APPROVE ]

[ REJECT ]


If rejected:

Admin must provide:

Rejection Reason


Example:

"Please complete the quiz section."


Instructor receives:

Course Rejected

Reason:

Please complete the quiz section.


# ============================================================
# 18. STUDENT FIRST-TIME EXPERIENCE
# ============================================================

After Student registers and logs in:

The system determines whether the student has already
created a learning profile.


If no career profile exists:

Show:

WHAT WOULD YOU LIKE TO DO?


[ FIND MY CAREER ]

I am not sure which career suits me.


[ I KNOW MY CAREER ]

I already know my target career.


# ============================================================
# 19. FIND MY CAREER FLOW
# ============================================================

Student selects:

FIND MY CAREER


        |
        v

CAREER DISCOVERY ASSESSMENT


The assessment should be interactive.

Do NOT show a boring long form.


Recommended question categories:

1. Interests
2. Work Preferences
3. Problem Solving
4. Technology Interests
5. Basic Technical Knowledge


Example:

"What would you enjoy doing most?"


A.

Building websites


B.

Creating backend systems


C.

Analyzing data


D.

Building mobile applications


Student selects an answer.


The system records the answer.


After multiple questions:

        |
        v

CALCULATE CAREER MATCH


Example result:

Frontend Developer

86% Match


Full Stack Developer

74% Match


Java Backend Developer

58% Match


Student can then:

Select a recommended career.


# ============================================================
# 20. I KNOW MY CAREER FLOW
# ============================================================

Student selects:

I KNOW MY CAREER


        |
        v

SELECT CAREER


Example:

Java Backend Developer


        |
        v

SKILL ASSESSMENT


The system still needs to understand:

"What skills does this student already have?"


Example:

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


The system uses this information to personalize
the roadmap.


# ============================================================
# 21. SKILL ASSESSMENT
# ============================================================

Assessment questions are mapped to skills.


Example:

Question:

"What is inheritance?"


Skill:

Java / OOP


Difficulty:

INTERMEDIATE


Another Question:

"What is SQL JOIN?"


Skill:

SQL


Difficulty:

INTERMEDIATE


Relationship:

QUESTION
    |
    v
SKILL


Student answers questions.


The system calculates:

Student Skill Profile.


Example:

JAVA

75%


SQL

40%


SPRING BOOT

20%


REST API

10%


GIT

60%


# ============================================================
# 22. STUDENT SKILL PROFILE
# ============================================================

The Student Skill Profile represents
the student's estimated knowledge.

Example:

Student:

John


Skills:

Java

████████░░

80%


SQL

████░░░░░░

40%


Spring Boot

██░░░░░░░░

20%


REST API

█░░░░░░░░░

10%


The skill profile should update continuously.


# ============================================================
# 23. SKILL GAP ANALYSIS
# ============================================================

The system compares:

STUDENT SKILL LEVEL

with:

CAREER REQUIRED LEVEL


Example:


JAVA

Student:

75


Required:

80


Gap:

5


SQL

Student:

40


Required:

70


Gap:

30


SPRING BOOT

Student:

20


Required:

70


Gap:

50


REST API

Student:

10


Required:

60


Gap:

50


The system identifies the skills
that the student needs to improve.


# ============================================================
# 24. PERSONALIZED ROADMAP GENERATION
# ============================================================

Input:

Student Skill Profile

+

Selected Career

+

Career Required Skills

+

Skill Importance

+

Skill Dependencies


Output:

Personalized Roadmap


Example:

Target Career:

Java Backend Developer


Student already knows:

Java


Student needs:

SQL
Spring Boot
REST API
JPA
Security


Generated Roadmap:


PHASE 1

Database Fundamentals

SQL


PHASE 2

Backend Framework

Spring Boot


PHASE 3

API Development

REST API


PHASE 4

Data Access

JPA/Hibernate


PHASE 5

Security

Spring Security


PHASE 6

Deployment

Docker


PHASE 7

Real-World Project


The roadmap can skip or mark completed skills
that the student already knows.


# ============================================================
# 25. ROADMAP STRUCTURE
# ============================================================

The roadmap should be structured like this:

ROADMAP

    |
    +--------------------+

    PHASE 1

    Programming Foundation

    Skills:

    Java
    OOP


    |
    +--------------------+

    PHASE 2

    Database Fundamentals

    Skills:

    SQL


    |
    +--------------------+

    PHASE 3

    Backend Framework

    Skills:

    Spring Boot


    |
    +--------------------+

    PHASE 4

    API Development

    Skills:

    REST API


Each phase has:

- Name
- Description
- Order
- Required Skills
- Progress
- Status


Possible phase status:

NOT_STARTED

IN_PROGRESS

COMPLETED

SKIPPED


# ============================================================
# 26. PHASE PAGE
# ============================================================

When the Student clicks a phase:

Example:

PHASE 3

BACKEND FRAMEWORK


The system displays:


Description:

Learn how to build backend applications
using Spring Boot.


Required Skills:

Spring Boot


Student Current Skill:

20%


Required Career Level:

70%


Then the system displays:

COURSES FOR THIS PHASE


# ============================================================
# 27. COURSE DISCOVERY
# ============================================================

The system finds all published courses
that teach the required skills.


Example:

Phase requires:

Spring Boot


System finds:

Course A:

Spring Boot for Beginners


Course B:

Complete Spring Boot Development


Course C:

Advanced Spring Boot


Only PUBLISHED courses should be considered.


The system filters:

DRAFT

PENDING_APPROVAL

REJECTED

ARCHIVED


Only:

PUBLISHED

courses can be recommended.


# ============================================================
# 28. COURSE RECOMMENDATION ENGINE
# ============================================================

The system calculates the best course
for the specific student.


Recommended criteria:


1. Rating

Weight:

30%


2. Review Confidence / Number of Ratings

Weight:

15%


3. Skill Match

Weight:

20%


4. Difficulty Match

Weight:

10%


5. Course Completion Rate

Weight:

10%


6. Course Quality

Weight:

10%


7. Course Freshness

Weight:

5%


Total:

100%


# ============================================================
# 29. COURSE RECOMMENDATION FORMULA
# ============================================================

Recommendation Score =


Rating Score

* 0.30


+

Review Confidence

* 0.15


+

Skill Match

* 0.20


+

Difficulty Match

* 0.10


+

Completion Rate

* 0.10


+

Course Quality

* 0.10


+

Freshness

* 0.05


The system ranks courses.

Highest score:

RECOMMENDED COURSE


# ============================================================
# 30. COURSE RECOMMENDATION EXAMPLE
# ============================================================

Student:

Spring Boot Skill = 20%


Phase:

Backend Framework


Required Skill:

Spring Boot


Available Courses:


COURSE A

Spring Boot for Beginners

Rating:

4.8

Reviews:

1,200

Difficulty:

BEGINNER

Completion Rate:

85%


COURSE B

Advanced Spring Boot

Rating:

4.9

Reviews:

20

Difficulty:

ADVANCED

Completion Rate:

45%


COURSE C

Complete Spring Boot

Rating:

4.5

Reviews:

600

Difficulty:

INTERMEDIATE


For this student:

COURSE A

is most suitable.


Why?


- Student is beginner
- Course difficulty matches
- Strong rating
- Many reviews
- High completion rate
- Strong skill match


# ============================================================
# 31. RECOMMENDED COURSE UI
# ============================================================

Example:


BACKEND FRAMEWORK


Required Skill:

Spring Boot


Your Current Level:

20%


---------------------------------------------


⭐ RECOMMENDED FOR YOU


Spring Boot for Beginners


⭐ 4.8

1,200 ratings


Difficulty:

Beginner


Why recommended?


✓ Matches your skill level

✓ Covers required skills

✓ Highly rated

✓ High completion rate


[ START COURSE ]


---------------------------------------------


OTHER COURSES


Complete Spring Boot

⭐ 4.6


Advanced Spring Boot

⭐ 4.8


Spring Boot REST API

⭐ 4.5


# ============================================================
# 32. COURSE ENROLLMENT
# ============================================================

Student selects:

START COURSE


        |
        v

CREATE ENROLLMENT


Status:

ENROLLED


        |
        v

Student opens course.


Status becomes:

IN_PROGRESS


The system tracks:

- Enrollment date
- Last accessed date
- Course progress
- Completed lessons
- Quiz results
- Completion status


# ============================================================
# 33. COURSE LEARNING STRUCTURE
# ============================================================

Course:

Spring Boot for Beginners


        |
        +-------------------+

        Lesson 1

        Introduction to Spring Boot


        |
        +-------------------+

        Lesson 2

        Dependency Injection


        |
        +-------------------+

        Lesson 3

        Controllers


        |
        +-------------------+

        Lesson 4

        REST API


        |
        +-------------------+

        Quiz


        |
        +-------------------+

        Assignment


# ============================================================
# 34. LESSON PAGE
# ============================================================

The lesson page contains:

LESSON CONTENT


Examples:

- Text
- Explanations
- Code
- Images
- Examples
- Exercises


Example:


LESSON:

Dependency Injection


Content:

Spring uses Dependency Injection
to automatically provide objects
to other components.


Code Example:

@Service
public class UserService {

}


The lesson page also contains:

AI ASSISTANT


# ============================================================
# 35. AI ASSISTANT INSIDE LESSON
# ============================================================

IMPORTANT FEATURE:

The AI Assistant should be available
while the student is learning a lesson.


Example UI:


LESSON CONTENT


                         [ AI ASSISTANT 🤖 ]


The student can interact with the AI
without leaving the lesson.


The AI Assistant can:


1. Explain Concepts

Example:

Student asks:

"What is Dependency Injection?"


AI gives:

Simple explanation

Example

Analogy


---------------------------------------------------------------

2. Summarize Lesson


Student clicks:

[ SUMMARIZE ]


AI generates:

Short summary of the current lesson.


---------------------------------------------------------------

3. Explain Selected Text


Student selects:

"Dependency Injection"


Student asks:

"Explain this."


AI explains the selected concept.


---------------------------------------------------------------

4. Generate Examples


Student asks:

"Give me a simple Java example."


AI generates an educational example.


---------------------------------------------------------------

5. Generate Practice Questions


Student clicks:

[ PRACTICE ME ]


AI generates practice questions
related to the current lesson.


---------------------------------------------------------------

6. Give Hints


Student is solving an exercise.


Student asks:

"Give me a hint."


AI provides a hint instead of
immediately giving the answer.


---------------------------------------------------------------

7. Explain Code


Student asks:

"Explain this code."


AI explains:

- Class
- Method
- Variables
- Logic


---------------------------------------------------------------

8. Answer Learning Questions


Student asks:

"Why do we use @Autowired?"


AI explains the concept.


# ============================================================
# 36. AI ASSISTANT CONTEXT
# ============================================================

The AI Assistant should understand
the current learning context.


Example:


Student is inside:


Course:

Spring Boot for Beginners


Lesson:

Dependency Injection


Therefore AI requests should include:

Course context

+

Lesson context

+

Lesson content


This allows AI responses to be more relevant.


Example:


Without context:

Student asks:

"Explain this."


AI does not know what "this" means.


With context:

Current Lesson:

Dependency Injection


Selected Text:

@Autowired injects dependencies.


AI can provide a relevant explanation.


# ============================================================
# 37. AI ASSISTANT ROLE
# ============================================================

AI should support learning.

AI responsibilities:

- Explain
- Simplify
- Summarize
- Give examples
- Generate practice
- Generate questions
- Give hints
- Explain code
- Help students understand lessons


AI should NOT control:

- Career structure
- Skill library
- Admin decisions
- Course approval
- Core roadmap generation


Core recommendation:

Algorithm-based


AI:

Learning assistant


# ============================================================
# 38. LESSON PROGRESS
# ============================================================

Student opens lesson.

        |
        v

Lesson Status:

IN_PROGRESS


Student finishes lesson.

        |
        v

Click:

MARK AS COMPLETE


Lesson Status:

COMPLETED


Course Progress updates.


Example:

10 lessons


Completed:

7


Progress:

70%


# ============================================================
# 39. QUIZ SYSTEM
# ============================================================

After lessons or course sections:

Student takes a quiz.


Quiz contains:

- Multiple Choice
- True/False
- Multiple Select
- Scenario Questions
- Code Questions


Student submits quiz.


System calculates:

Quiz Score


Example:

8 / 10


80%


If score >= passing score:

PASSED


Otherwise:

FAILED


Student can:

Retry quiz

Review lesson

Practice with AI Assistant


# ============================================================
# 40. AI ASSISTANT AFTER QUIZ
# ============================================================

The AI Assistant can also help students
understand incorrect answers.


Example:

Question:

What does @RestController do?


Student selects wrong answer.


System displays:

Incorrect.


Student can click:

[ ASK AI WHY ]


AI explains:

- Why the answer is incorrect
- Why the correct answer is correct
- Related concept


This creates a better learning experience.


# ============================================================
# 41. ASSIGNMENTS AND PROJECTS
# ============================================================

Courses can contain:

Assignments


Example:

Create a simple Spring Boot REST API.


Or projects.


Example:

Build a Student Management System.


Assignment workflow:

Student receives assignment

        |
        v

Completes assignment

        |
        v

Submits assignment

        |
        v

Instructor/System evaluates

        |
        v

Result stored


Assignment results can contribute
to skill progress.


# ============================================================
# 42. COURSE COMPLETION
# ============================================================

A course is completed when:

Required Lessons

+

Required Quizzes

+

Assignments/Projects if required

are completed.


Example:

Lessons:

100%


Quiz:

Passed


Assignment:

Completed


Result:

COURSE COMPLETED


# ============================================================
# 43. COURSE RATING AND REVIEW
# ============================================================

After course completion:

Student can rate the course.


Example:


COURSE COMPLETED 🎉


How would you rate this course?


☆ ☆ ☆ ☆ ☆


Student selects:

5 stars


Optional:

Write a Review


Example:

"Very clear explanation and useful examples."


Business rule:

One student can submit
one review per course.


Recommended rule:

Only students who completed the course
can submit a rating/review.


# ============================================================
# 44. COURSE REVIEW SYSTEM
# ============================================================

Course Review contains:

- Review ID
- Student ID
- Course ID
- Rating
- Review Text
- Created Date
- Updated Date


Relationship:

STUDENT

    |
    v

COURSE_REVIEW

    |
    v

COURSE


Course Rating:

Average of student ratings.


Example:

Ratings:

5
5
4
4
5


Average:

4.6


Display:

⭐ 4.6


# ============================================================
# 45. SKILL PROGRESS UPDATE
# ============================================================

The student's skill profile should update
after learning.


Initial Assessment:


Spring Boot:

20%


After completing course:

40%


After quiz:

55%


After assignment:

70%


The skill profile is dynamic.


Possible skill progress sources:

- Initial Assessment
- Course Completion
- Quiz Results
- Assignment Results
- Project Results


Example weighted calculation:


Skill Score =


Assessment Score

* 0.30


+

Quiz Score

* 0.30


+

Assignment/Project Score

* 0.40


The exact formula can be adjusted.


# ============================================================
# 46. ROADMAP PROGRESS UPDATE
# ============================================================

Career requirement:

Spring Boot:

70%


Student initially:

20%


After learning:

75%


The skill requirement is achieved.


System updates:

Phase Status:

COMPLETED


The next phase becomes:

IN_PROGRESS


Example:


PHASE 1

Java Foundation

✓ COMPLETED


PHASE 2

Database Fundamentals

✓ COMPLETED


PHASE 3

Backend Framework

✓ COMPLETED


PHASE 4

API Development

→ IN PROGRESS


PHASE 5

Security

🔒 NOT STARTED


# ============================================================
# 47. ADAPTIVE ROADMAP
# ============================================================

The roadmap can adapt based on
the student's updated skills.


Example:


Initial Skills:

Java:

30%


SQL:

20%


Spring Boot:

0%


Roadmap:

1. Java
2. SQL
3. Spring Boot


After assessment or learning:

Java:

85%


SQL:

75%


Spring Boot:

10%


System updates roadmap:


Java:

COMPLETED


SQL:

COMPLETED


Spring Boot:

ACTIVE


This prevents unnecessary learning.


# ============================================================
# 48. RECOMMEND NEXT COURSE
# ============================================================

After a student completes a course:

System updates:

- Course progress
- Skill profile
- Skill gaps
- Phase progress


Then the system determines:

What should the student learn next?


Example:


Student completed:

Spring Boot Beginner


Spring Boot level:

20%

to

60%


Next recommendation:

Spring Boot Intermediate


or:

REST API Fundamentals


depending on:

- Required skill level
- Current skill level
- Current phase
- Skill dependencies


# ============================================================
# 49. STUDENT DASHBOARD
# ============================================================

The Student Dashboard should display:


WELCOME BACK


TARGET CAREER

Java Backend Developer


ROADMAP PROGRESS

45%


CURRENT PHASE

Backend Framework


CURRENT COURSE

Spring Boot for Beginners

Progress:

65%


SKILL PROGRESS

Java:

85%


SQL:

70%


Spring Boot:

55%


REST API:

20%


RECOMMENDED NEXT

REST API Fundamentals


ACHIEVEMENTS

🏆 Java Foundation

🏆 SQL Explorer


# ============================================================
# 50. INSTRUCTOR DASHBOARD
# ============================================================

Instructor Dashboard includes:


MY COURSES


Draft:

3


Pending Approval:

2


Published:

5


Rejected:

1


Actions:

[ CREATE COURSE ]


Course List:


Java Programming

PUBLISHED


Spring Boot Basics

PENDING APPROVAL


Advanced Java

REJECTED


Instructor can view:

- Course statistics
- Enrollment count
- Completion rate
- Average rating
- Reviews


# ============================================================
# 51. ADMIN DASHBOARD
# ============================================================

Admin Dashboard includes:


TOTAL STUDENTS

1,250


TOTAL INSTRUCTORS

50


TOTAL COURSES

200


PENDING COURSE APPROVALS

12


TOTAL CAREERS

10


TOTAL SKILLS

80


RECENT ACTIVITY


Admin actions:


MANAGE USERS


MANAGE INSTRUCTORS


MANAGE SKILLS


MANAGE CAREERS


MANAGE ASSESSMENTS


REVIEW COURSES


MODERATE REVIEWS


VIEW REPORTS


# ============================================================
# 52. SKILL EXCHANGE
# ============================================================

Skill Exchange allows students to find
other students with complementary skills.


Example:


STUDENT A


Strong Skills:

Java


Needs Help:

React


STUDENT B


Strong Skills:

React


Needs Help:

Java


System can suggest:


POTENTIAL SKILL PARTNER


Student A

<------>

Student B


Possible Skill Exchange features:

- View student skills
- View learning goals
- Send connection request
- Accept/reject request
- Communicate
- Exchange knowledge


# ============================================================
# 53. CERTIFICATES
# ============================================================

After completing a course:

System can generate a certificate.


Certificate contains:

- Student Name
- Course Name
- Instructor Name
- Completion Date
- Certificate ID


Example:


CERTIFICATE OF COMPLETION


Awarded to:

John Doe


For completing:

Java Programming for Beginners


# ============================================================
# 54. BADGES
# ============================================================

Students can earn badges.


Examples:


Java Beginner


SQL Explorer


Backend Explorer


Course Finisher


Project Builder


Roadmap Champion


Badges are awarded based on achievements.


# ============================================================
# 55. COMPLETE STUDENT WORKFLOW
# ============================================================

REGISTER

        |
        v

SELECT:

STUDENT

        |
        v

CREATE ACCOUNT

        |
        v

LOGIN

        |
        v

STUDENT DASHBOARD

        |
        v

CHOOSE:


FIND MY CAREER

OR


I KNOW MY CAREER


        |
        v

ASSESSMENT

        |
        v

SKILL PROFILE

        |
        v

CAREER MATCH / SELECT CAREER

        |
        v

SKILL GAP ANALYSIS

        |
        v

PERSONALIZED ROADMAP

        |
        v

SELECT PHASE

        |
        v

VIEW REQUIRED SKILLS

        |
        v

VIEW AVAILABLE COURSES

        |
        v

COURSE RECOMMENDATION ENGINE

        |
        v

⭐ RECOMMENDED COURSE

        |
        v

ENROLL

        |
        v

LESSONS

        |
        v

AI ASSISTANT

        |
        v

QUIZZES

        |
        v

ASSIGNMENTS / PROJECTS

        |
        v

COURSE COMPLETION

        |
        v

RATE COURSE

        |
        v

UPDATE SKILL PROFILE

        |
        v

UPDATE ROADMAP

        |
        v

NEXT PHASE

        |
        v

REPEAT


# ============================================================
# 56. COMPLETE INSTRUCTOR WORKFLOW
# ============================================================

SELECT:

INSTRUCTOR


        |
        v

CREATE ACCOUNT

        |
        v

ENTER INSTRUCTOR DETAILS

        |
        v

LOGIN

        |
        v

INSTRUCTOR DASHBOARD

        |
        v

CREATE COURSE

        |
        v

ENTER COURSE INFORMATION

        |
        v

SELECT EXISTING SKILLS

        |
        v

SET DIFFICULTY

        |
        v

CREATE LESSONS

        |
        v

CREATE QUIZZES

        |
        v

CREATE ASSIGNMENTS

        |
        v

SAVE AS DRAFT

        |
        v

SUBMIT FOR APPROVAL

        |
        v

PENDING APPROVAL

        |
        v

ADMIN REVIEW


       / \


   APPROVE   REJECT


      |         |


      v         v


 PUBLISHED   EDIT COURSE


      |         |


      |         v


      |      RESUBMIT


      |         |


      +---------+


          |


          v


STUDENTS CAN ENROLL


# ============================================================
# 57. COMPLETE ADMIN WORKFLOW
# ============================================================

ADMIN LOGIN

        |
        v

ADMIN DASHBOARD


        |
        +-------------------------------------+

        |
        v

SKILL MANAGEMENT


Create Skills

Edit Skills

Delete Skills


        |
        +-------------------------------------+

        |
        v

CAREER MANAGEMENT


Create Career

Select Skills

Set Required Levels

Set Importance

Create Career Structure


        |
        +-------------------------------------+

        |
        v

ASSESSMENT MANAGEMENT


Create Questions

Map Questions to Skills

Set Difficulty

Set Answers

Set Scoring


        |
        +-------------------------------------+

        |
        v

COURSE APPROVAL


View Pending Courses

Review Content


        |
        +-------------------+


        |                   |


     APPROVE             REJECT


        |                   |


        v                   v


   PUBLISHED           PROVIDE REASON


                            |


                            v


                      INSTRUCTOR EDITS


        |
        +-------------------------------------+

        |
        v

USER MANAGEMENT


Manage Students

Manage Instructors

Manage Accounts


        |
        +-------------------------------------+

        |
        v

REVIEW MODERATION


View Reviews

Remove Inappropriate Reviews


        |
        +-------------------------------------+

        |
        v

REPORTS


Users

Courses

Enrollments

Ratings

Career Popularity

Skill Popularity

Completion Rates


# ============================================================
# 58. COMPLETE SYSTEM DATA FLOW
# ============================================================


ADMIN

    |

    v

CREATES SKILLS

    |

    v

CREATES CAREERS

    |

    v

MAPS CAREERS TO SKILLS

    |

    v

CREATES ASSESSMENTS



INSTRUCTOR

    |

    v

CREATES COURSES

    |

    v

MAPS COURSES TO SKILLS

    |

    v

CREATES LESSONS

    |

    v

SUBMITS COURSE

    |

    v

ADMIN APPROVES

    |

    v

COURSE PUBLISHED



STUDENT

    |

    v

TAKES ASSESSMENT

    |

    v

SKILL PROFILE

    |

    v

CAREER SELECTION

    |

    v

SKILL GAP ANALYSIS

    |

    v

ROADMAP

    |

    v

PHASE

    |

    v

REQUIRED SKILLS

    |

    v

FIND PUBLISHED COURSES

    |

    v

RECOMMENDATION ENGINE

    |

    v

RECOMMENDED COURSE

    |

    v

LEARNING



LEARNING

    |

    +------------------------+

    |                        |

    v                        v

LESSON                 AI ASSISTANT

    |                        |

    |                        |

    +-----------+------------+

                |

                v

             QUIZ

                |

                v

         ASSIGNMENT

                |

                v

        COURSE COMPLETE

                |

                v

         COURSE REVIEW

                |

                v

        SKILL UPDATE

                |

                v

        ROADMAP UPDATE

                |

                v

          NEXT PHASE


# ============================================================
# 59. CORE DATABASE RELATIONSHIP CONCEPT
# ============================================================

USER

    |

    +---------------------------+

    |             |             |

STUDENT      INSTRUCTOR       ADMIN


------------------------------------------------


CAREER

    |

CAREER_SKILL

    |

SKILL


------------------------------------------------


COURSE

    |

COURSE_SKILL

    |

SKILL


------------------------------------------------


COURSE

    |

LESSON


------------------------------------------------


COURSE

    |

QUIZ

    |

QUIZ_QUESTION


------------------------------------------------


STUDENT

    |

ENROLLMENT

    |

COURSE


------------------------------------------------


STUDENT

    |

SKILL_PROGRESS

    |

SKILL


------------------------------------------------


STUDENT

    |

COURSE_REVIEW

    |

COURSE


------------------------------------------------


STUDENT

    |

ROADMAP

    |

ROADMAP_PHASE

    |

PHASE_SKILL

    |

SKILL


# ============================================================
# 60. IMPORTANT BUSINESS RULES
# ============================================================


RULE 1:

One login system is used for all roles.


RULE 2:

After login, users are redirected based on their role.


RULE 3:

Student and Instructor have different signup forms.


RULE 4:

Instructor signup requires additional professional details.


RULE 5:

Admin accounts should be created securely and should
not normally be publicly available through signup.


RULE 6:

Skills are globally shared.


RULE 7:

Admin manages the Skill Library.


RULE 8:

Instructors select existing skills when creating courses.


RULE 9:

Instructors should not create duplicate global skills.


RULE 10:

Courses are not public immediately after creation.


RULE 11:

Courses must be approved by Admin before publishing.


RULE 12:

Rejected courses must remain unavailable to students.


RULE 13:

Admin should provide a rejection reason.


RULE 14:

Instructors can edit rejected courses.


RULE 15:

Instructors can resubmit rejected courses.


RULE 16:

Only PUBLISHED courses can be recommended.


RULE 17:

Roadmaps contain PHASES, not fixed courses.


RULE 18:

Phases contain required skills.


RULE 19:

Courses teach skills.


RULE 20:

A recommendation engine selects suitable courses
for each student.


RULE 21:

Course rating alone must not determine recommendations.


RULE 22:

Course recommendation considers:

- Rating
- Review count
- Skill match
- Difficulty match
- Completion rate
- Course quality
- Freshness


RULE 23:

Students should only rate courses they completed.


RULE 24:

One student should only have one review per course.


RULE 25:

Student skill levels should update after learning.


RULE 26:

Roadmaps should update according to student progress.


RULE 27:

AI Assistant should be available during lessons.


RULE 28:

AI Assistant should understand the current lesson context.


RULE 29:

AI Assistant should support learning, not replace
the core recommendation algorithm.


RULE 30:

Role authorization must be enforced by the backend.


# ============================================================
# 61. FINAL SYSTEM PRINCIPLE
# ============================================================

The complete SkillHub system follows this structure:


                 ADMIN
                   |
                   v
        SKILLS + CAREERS + ASSESSMENTS
                   |
                   v
              SYSTEM STRUCTURE


INSTRUCTOR
    |
    v
CREATE COURSE
    |
    v
SELECT SKILLS
    |
    v
CREATE LESSONS
    |
    v
CREATE QUIZZES
    |
    v
SUBMIT COURSE
    |
    v
ADMIN APPROVAL
    |
    v
PUBLISHED COURSE


STUDENT
    |
    v
ASSESSMENT
    |
    v
SKILL PROFILE
    |
    v
CAREER SELECTION
    |
    v
SKILL GAP ANALYSIS
    |
    v
PERSONALIZED ROADMAP
    |
    v
PHASE
    |
    v
REQUIRED SKILLS
    |
    v
FIND COURSES
    |
    v
COURSE RECOMMENDATION
    |
    v
⭐ BEST COURSE
    |
    v
LEARN LESSON
    |
    +-----------------------+
    |                       |
    v                       v
LESSON CONTENT        AI ASSISTANT
    |                       |
    +-----------+-----------+
                |
                v
               QUIZ
                |
                v
        ASSIGNMENT/PROJECT
                |
                v
        COURSE COMPLETION
                |
                v
          COURSE RATING
                |
                v
          SKILL UPDATE
                |
                v
         ROADMAP UPDATE
                |
                v
            NEXT PHASE


# ============================================================
# 62. SIMPLE SUMMARY
# ============================================================

Admin builds the platform structure.

Admin creates:

- Skills
- Careers
- Career skill requirements
- Assessments
- Questions


Instructor creates learning content.

Instructor creates:

- Courses
- Lessons
- Quizzes
- Assignments

Instructor maps courses to existing skills.

Instructor submits courses for Admin approval.

Admin approves or rejects courses.

Only approved courses become public.


Student enters the platform.

Student can:

- Discover a career
OR
- Select a known career


The system assesses student skills.

The system compares student skills with career requirements.

The system calculates skill gaps.

The system creates a personalized roadmap.

The roadmap contains phases.

Each phase contains required skills.

The system finds published courses that teach those skills.

The recommendation engine ranks courses.

The best suitable course receives:

⭐ RECOMMENDED FOR YOU


Student learns through lessons.

Inside lessons, the Student can use an AI Assistant.

The AI Assistant can:

- Explain
- Summarize
- Give examples
- Generate practice
- Give hints
- Explain code
- Help with quiz mistakes


After learning:

Student completes quizzes and assignments.

The system updates:

- Course progress
- Skill profile
- Roadmap progress


The system then recommends:

The next skill,
phase,
or course.


This process continues until the student completes
their personalized career roadmap.


# ============================================================
# END OF COMPLETE SYSTEM WORKFLOW
# ============================================================