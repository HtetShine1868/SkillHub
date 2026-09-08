package com.example.backend.config;

import com.example.backend.assessment.AssessmentQuestion;
import com.example.backend.assessment.AssessmentQuestionRepository;
import com.example.backend.career.*;
import com.example.backend.course.*;
import com.example.backend.course.lesson.Lesson;
import com.example.backend.course.lesson.LessonRepository;
import com.example.backend.skill.Skill;
import com.example.backend.skill.SkillRepository;
import com.example.backend.skillexchange.entity.JoinRequest;
import com.example.backend.skillexchange.entity.Project;
import com.example.backend.skillexchange.repository.JoinRequestRepository;
import com.example.backend.skillexchange.repository.ProjectRepository;
import com.example.backend.user.entity.AuthProvider;
import com.example.backend.user.entity.Role;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final CareerRepository careerRepository;
    private final CareerSkillRepository careerSkillRepository;
    private final CareerDiscoveryQuestionRepository discoveryQuestionRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final CourseSkillRepository courseSkillRepository;
    private final CoursePrerequisiteRepository coursePrerequisiteRepository;
    private final ProjectRepository projectRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting DataInitializer check...");

        // Ensure PostgreSQL check constraint is updated to include INSTRUCTOR
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            jdbcTemplate.execute("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'INSTRUCTOR', 'ADMIN'))");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT TRUE");
        } catch (Exception e) {
            log.warn("Could not update users_role_check constraint or columns: {}", e.getMessage());
        }

        // Ensure new fields exist on courses table
        try {
            jdbcTemplate.execute("ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'PUBLISHED'");
            jdbcTemplate.execute("ALTER TABLE courses ADD COLUMN IF NOT EXISTS rejection_reason TEXT");
            jdbcTemplate.execute("ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_name VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE courses ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0");
        } catch (Exception e) {
            log.warn("Could not alter courses table columns: {}", e.getMessage());
        }

        // Merge duplicate skills that were seeded under an older name in a previous
        // version of this file (e.g. "Docker & K8s" vs the current "Docker & Kubernetes").
        // Skill lookups elsewhere are name-based (findByNameIgnoreCase), so a rename
        // in this file otherwise leaves a stale, orphaned duplicate skill row behind
        // with its own disconnected career_skills/course_skills/user_skills/
        // assessment_questions references, silently corrupting skill-gap and roadmap
        // calculations (e.g. a career requiring the same skill "twice" under two ids).
        mergeDuplicateSkill("Docker & K8s", "Docker & Kubernetes");

        // ===================== USERS =====================
        User admin = seedUser("admin@skillhub.com", "Admin User", Role.ADMIN, "Lead Admin and Platform Architect");
        User instructor = seedUser("instructor@skillhub.com", "Sarah Instructor", Role.INSTRUCTOR, "Senior Tech Lead & Certified Educator");
        User user  = seedUser("user@skillhub.com",  "John Developer", Role.USER, "Full-stack enthusiast learning Spring Boot & React");
        User alice = seedUser("alice@skillhub.com", "Alice Smith", Role.USER, "Data Science & AI practitioner with 3 years experience");
        User bob   = seedUser("bob@skillhub.com",   "Bob Chen", Role.USER, "DevOps & Cloud infrastructure engineer");

        // ===================== SKILLS =====================
        Skill sJava       = seedSkill("Java",                  "Backend",     "Core Java, OOP, Streams, Generics, and Multithreading");
        Skill sSpring     = seedSkill("Spring Boot",           "Framework",   "Spring MVC, Security, Data JPA, REST APIs and Microservices");
        Skill sReact      = seedSkill("React.js",              "Frontend",    "Hooks, Context API, state management, and component design");
        Skill sTS         = seedSkill("TypeScript",            "Frontend",    "Static typing, interfaces, generics, and type safety in JS");
        Skill sSql        = seedSkill("SQL & PostgreSQL",      "Database",    "Relational DB design, complex queries, joins, and indexing");
        Skill sDocker     = seedSkill("Docker & Kubernetes",   "DevOps",      "Containerization, Docker Compose, K8s deployments & Helm");
        Skill sPython     = seedSkill("Python",                "Data",        "Pandas, NumPy, data analysis, and scripting");
        Skill sML         = seedSkill("Machine Learning",      "Data",        "Supervised/Unsupervised learning, scikit-learn, model evaluation");
        Skill sAWS        = seedSkill("AWS Cloud",             "Cloud",       "EC2, S3, RDS, Lambda, IAM, and cloud architecture patterns");
        Skill sGraphQL    = seedSkill("GraphQL",               "API",         "Schema design, resolvers, queries, mutations, and subscriptions");
        Skill sGit        = seedSkill("Git & GitHub",          "DevOps",      "Version control, branching strategies, PRs, and CI workflows");
        Skill sCSS        = seedSkill("CSS & Tailwind",        "Frontend",    "Flexbox, Grid, animations, responsive design, utility-first CSS");
        Skill sNodeJS     = seedSkill("Node.js & Express",     "Backend",     "REST APIs with Express, middleware, async patterns, and npm");
        Skill sMongoDB    = seedSkill("MongoDB",               "Database",    "NoSQL document storage, aggregation pipelines, and Mongoose ODM");
        Skill sRedis      = seedSkill("Redis",                 "Database",    "Caching, pub/sub, session management, and rate limiting");
        Skill sKafka      = seedSkill("Apache Kafka",          "Backend",     "Event streaming, producers/consumers, topics, and partitions");
        Skill sLinux      = seedSkill("Linux & Bash",          "DevOps",      "Shell scripting, system administration, cron jobs, and file I/O");
        Skill sTerraform  = seedSkill("Terraform",             "Cloud",       "Infrastructure as Code, providers, modules, and state management");

        // ===================== CAREERS =====================
        Career cBackend = seedCareer("Backend Developer", "Engineering", "🔧",
                "Backend developers build server-side logic, database models, REST APIs and microservices that power modern web applications.",
                "Design & implement REST APIs;Model relational database schemas;Build scalable microservices;Optimize database query performance;Write unit & integration tests;Code review and architecture design");

        Career cFrontend = seedCareer("Frontend Developer", "Engineering", "🎨",
                "Frontend developers craft pixel-perfect, responsive, and accessible web user interfaces using modern JavaScript frameworks.",
                "Build interactive UIs with React & TypeScript;Implement responsive CSS layouts;Optimize Core Web Vitals & performance;Integrate REST APIs & GraphQL;Write component tests with Jest;Collaborate with designers on UX");

        Career cFullStack = seedCareer("Full Stack Engineer", "Engineering", "🚀",
                "Full Stack engineers own entire features end-to-end, from database design to beautiful UI delivery.",
                "Develop end-to-end features independently;Connect React frontends with Java or Node backends;Manage CI/CD pipelines;Design & optimize database schemas;Deploy applications to AWS or Kubernetes");

        Career cData = seedCareer("Data Scientist", "Data", "📊",
                "Data Scientists extract insights from complex datasets, build machine learning models and deliver data-driven business decisions.",
                "Clean & preprocess data with Pandas & NumPy;Train and evaluate ML models with scikit-learn;Create data visualizations and dashboards;Build predictive analytics pipelines;Present insights to non-technical stakeholders");

        Career cDevOps = seedCareer("DevOps Engineer", "Engineering", "⚙️",
                "DevOps Engineers bridge development and operations by automating infrastructure, deployments, and observability pipelines.",
                "Build & manage CI/CD pipelines;Containerize apps with Docker & Kubernetes;Monitor systems with Prometheus & Grafana;Manage cloud infrastructure with Terraform;Automate server provisioning with Ansible");

        Career cCloud = seedCareer("Cloud Architect", "Cloud", "☁️",
                "Cloud Architects design scalable, resilient, and cost-optimized cloud infrastructure on AWS, GCP, or Azure.",
                "Design multi-region cloud architectures;Select & implement appropriate cloud services;Optimize cloud spend and resource utilization;Define security policies and IAM roles;Mentor teams on cloud best practices");

        Career cMLEng = seedCareer("ML Engineer", "Data", "🤖",
                "ML Engineers deploy machine learning models into production systems, building scalable pipelines that integrate AI into real products.",
                "Build ML training & inference pipelines;Deploy models as REST APIs using FastAPI or Flask;Monitor model drift and performance;Optimize models for latency and throughput;Collaborate with Data Scientists on feature engineering");

        Career cMobile = seedCareer("Mobile Developer", "Engineering", "📱",
                "Mobile Developers build native or cross-platform iOS and Android applications with great user experiences.",
                "Build cross-platform apps with React Native or Flutter;Implement offline-first data sync;Integrate device APIs (camera, GPS, notifications);Publish to App Store & Google Play;Optimize app performance and battery usage");

        // ===================== CAREER SKILLS =====================
        seedCareerSkill(cBackend, sJava, 4, 0.9);
        seedCareerSkill(cBackend, sSpring, 4, 0.85);
        seedCareerSkill(cBackend, sSql, 3, 0.8);
        seedCareerSkill(cBackend, sDocker, 2, 0.6);
        seedCareerSkill(cBackend, sRedis, 2, 0.5);
        seedCareerSkill(cBackend, sGit, 3, 0.7);

        seedCareerSkill(cFrontend, sReact, 4, 0.95);
        seedCareerSkill(cFrontend, sTS, 3, 0.85);
        seedCareerSkill(cFrontend, sCSS, 4, 0.9);
        seedCareerSkill(cFrontend, sGit, 2, 0.6);
        seedCareerSkill(cFrontend, sSql, 1, 0.3);

        seedCareerSkill(cFullStack, sJava, 3, 0.8);
        seedCareerSkill(cFullStack, sSpring, 3, 0.8);
        seedCareerSkill(cFullStack, sReact, 4, 0.9);
        seedCareerSkill(cFullStack, sTS, 3, 0.75);
        seedCareerSkill(cFullStack, sSql, 3, 0.75);
        seedCareerSkill(cFullStack, sDocker, 2, 0.5);
        seedCareerSkill(cFullStack, sGit, 3, 0.7);

        seedCareerSkill(cData, sPython, 5, 0.95);
        seedCareerSkill(cData, sML, 4, 0.9);
        seedCareerSkill(cData, sSql, 4, 0.8);
        seedCareerSkill(cData, sAWS, 2, 0.5);

        seedCareerSkill(cDevOps, sDocker, 5, 0.95);
        seedCareerSkill(cDevOps, sLinux, 4, 0.9);
        seedCareerSkill(cDevOps, sAWS, 4, 0.85);
        seedCareerSkill(cDevOps, sTerraform, 3, 0.75);
        seedCareerSkill(cDevOps, sKafka, 2, 0.5);
        seedCareerSkill(cDevOps, sSql, 2, 0.4);

        seedCareerSkill(cCloud, sAWS, 5, 0.95);
        seedCareerSkill(cCloud, sTerraform, 4, 0.9);
        seedCareerSkill(cCloud, sDocker, 3, 0.75);
        seedCareerSkill(cCloud, sLinux, 3, 0.7);

        seedCareerSkill(cMLEng, sPython, 5, 0.95);
        seedCareerSkill(cMLEng, sML, 5, 0.95);
        seedCareerSkill(cMLEng, sDocker, 3, 0.7);
        seedCareerSkill(cMLEng, sAWS, 3, 0.65);
        seedCareerSkill(cMLEng, sSql, 3, 0.6);

        seedCareerSkill(cMobile, sReact, 4, 0.9);
        seedCareerSkill(cMobile, sTS, 3, 0.8);
        seedCareerSkill(cMobile, sCSS, 3, 0.7);
        seedCareerSkill(cMobile, sGit, 2, 0.6);

        // ===================== DISCOVERY QUESTIONS =====================
        // NOTE: seeding is idempotent per-question-text (seedDiscoveryQuestionIfMissing)
        // rather than gated by a one-time count() == 0 check, so it self-heals and
        // backfills correctly even on databases that only got partially seeded before.
        seedDiscoveryQuestionIfMissing(
            "What area of software engineering excites you the most?", 1,
            "[{\"label\":\"Building robust backend services & APIs\",\"description\":\"I enjoy logic, databases, and system architecture\",\"weights\":{\"1\":5,\"3\":4,\"5\":3}}," +
             "{\"label\":\"Creating interactive, polished user interfaces\",\"description\":\"I love design systems and great user experiences\",\"weights\":{\"2\":5,\"3\":4,\"8\":4}}," +
             "{\"label\":\"Analyzing data patterns and building AI models\",\"description\":\"I like math, statistics, and prediction models\",\"weights\":{\"4\":5,\"7\":5}}," +
             "{\"label\":\"Automating deployments & cloud infrastructure\",\"description\":\"I prefer Docker, CI/CD, and cluster reliability\",\"weights\":{\"5\":5,\"6\":4}}]"
        );
        seedDiscoveryQuestionIfMissing(
            "Which tech stack would you prefer working with daily?", 2,
            "[{\"label\":\"Java, Spring Boot, and PostgreSQL\",\"description\":\"Strict typing, powerful enterprise frameworks\",\"weights\":{\"1\":5,\"3\":4}}," +
             "{\"label\":\"TypeScript, React, and modern CSS\",\"description\":\"Fast feedback loops, rich visual interfaces\",\"weights\":{\"2\":5,\"3\":3,\"8\":4}}," +
             "{\"label\":\"Python, Pandas, and Jupyter Notebooks\",\"description\":\"Data frames, machine learning pipelines\",\"weights\":{\"4\":5,\"7\":5}}," +
             "{\"label\":\"Docker, Kubernetes, Bash, and Terraform\",\"description\":\"Infrastructure as code, cluster management\",\"weights\":{\"5\":5,\"6\":5}}]"
        );
        seedDiscoveryQuestionIfMissing(
            "How do you prefer to spend most of your workday?", 3,
            "[{\"label\":\"Writing and debugging server-side code\",\"description\":\"APIs, data models, and system performance\",\"weights\":{\"1\":5,\"3\":3}}," +
             "{\"label\":\"Designing and coding pixel-perfect UIs\",\"description\":\"Components, layouts, and animations\",\"weights\":{\"2\":5,\"8\":4}}," +
             "{\"label\":\"Exploring datasets and training models\",\"description\":\"Statistical analysis and experimentation\",\"weights\":{\"4\":5,\"7\":5}}," +
             "{\"label\":\"Maintaining servers, pipelines and cloud resources\",\"description\":\"Reliability, automation, and monitoring\",\"weights\":{\"5\":5,\"6\":5}}]"
        );
        seedDiscoveryQuestionIfMissing(
            "What kind of impact do you want your work to have?", 4,
            "[{\"label\":\"Power reliable systems that millions depend on\",\"description\":\"Scalability and performance matter to me\",\"weights\":{\"1\":4,\"5\":4,\"6\":4}}," +
             "{\"label\":\"Delight users with beautiful, intuitive experiences\",\"description\":\"Design and usability drive my decisions\",\"weights\":{\"2\":5,\"8\":5}}," +
             "{\"label\":\"Help organizations make smarter data-driven decisions\",\"description\":\"Insights and predictions create business value\",\"weights\":{\"4\":5,\"7\":5}}," +
             "{\"label\":\"Enable teams to ship faster and more reliably\",\"description\":\"DevOps culture and automation are my passion\",\"weights\":{\"5\":5,\"6\":4}}]"
        );
        seedDiscoveryQuestionIfMissing(
            "How comfortable are you with mathematics and statistics?", 5,
            "[{\"label\":\"Very comfortable — I enjoy math and algorithms\",\"description\":\"Linear algebra and statistics are my friends\",\"weights\":{\"4\":4,\"7\":4}}," +
             "{\"label\":\"Comfortable with basic logic and data structures\",\"description\":\"Problem solving through code is my strength\",\"weights\":{\"1\":4,\"3\":4}}," +
             "{\"label\":\"I prefer visual and creative problem-solving\",\"description\":\"Design thinking appeals more to me\",\"weights\":{\"2\":5,\"8\":4}}," +
             "{\"label\":\"I like process automation and systems thinking\",\"description\":\"I prefer structured repeatable workflows\",\"weights\":{\"5\":5,\"6\":5}}]"
        );

        // Additional discovery questions to better differentiate careers that share
        // very similar skill sets (Data Scientist vs ML Engineer, DevOps vs Cloud
        // Architect). Added idempotently (by question text) so they also backfill
        // onto databases that were already seeded with the original 5 questions.
        seedDiscoveryQuestionIfMissing(
            "When working with data and models, which excites you more?", 6,
            String.format(
                "[{\"label\":\"Exploring datasets to find patterns and tell a data story\",\"description\":\"I enjoy statistical analysis and generating insights\",\"weights\":{\"%d\":5,\"%d\":2,\"%d\":1}}," +
                 "{\"label\":\"Building and deploying the pipeline that serves a model to real users\",\"description\":\"I enjoy engineering and productionizing ML systems\",\"weights\":{\"%d\":5,\"%d\":2,\"%d\":2}}," +
                 "{\"label\":\"Designing the UI that presents insights to end users\",\"description\":\"I enjoy visual storytelling and interface design\",\"weights\":{\"%d\":4,\"%d\":2}}," +
                 "{\"label\":\"Automating the infrastructure that the whole data platform runs on\",\"description\":\"I enjoy reliability, pipelines, and automation\",\"weights\":{\"%d\":4,\"%d\":3}}]",
                cData.getId(), cMLEng.getId(), cBackend.getId(),
                cMLEng.getId(), cData.getId(), cDevOps.getId(),
                cFrontend.getId(), cFullStack.getId(),
                cDevOps.getId(), cCloud.getId()
            )
        );
        seedDiscoveryQuestionIfMissing(
            "What part of cloud & infrastructure work interests you most?", 7,
            String.format(
                "[{\"label\":\"Automating CI/CD pipelines and keeping deployments smooth day-to-day\",\"description\":\"I enjoy build automation and operational reliability\",\"weights\":{\"%d\":5,\"%d\":2}}," +
                 "{\"label\":\"Designing the overall cloud architecture and optimizing costs at scale\",\"description\":\"I enjoy big-picture system design and trade-off decisions\",\"weights\":{\"%d\":5,\"%d\":2}}," +
                 "{\"label\":\"Writing the backend services that need to run reliably on that infrastructure\",\"description\":\"I enjoy application-level engineering\",\"weights\":{\"%d\":4,\"%d\":2}}," +
                 "{\"label\":\"Training and scaling machine learning workloads in the cloud\",\"description\":\"I enjoy ML infrastructure and distributed training\",\"weights\":{\"%d\":4,\"%d\":2}}]",
                cDevOps.getId(), cBackend.getId(),
                cCloud.getId(), cDevOps.getId(),
                cBackend.getId(), cFullStack.getId(),
                cMLEng.getId(), cData.getId()
            )
        );

        // ===================== ASSESSMENT QUESTIONS =====================
        // NOTE: seeding is idempotent per-skill+question-text (seedAssessmentQuestionIfMissing)
        // rather than gated by a one-time count() == 0 check, so it self-heals and
        // backfills correctly even on databases that only got partially seeded before
        // (e.g. by an older version of this file).
        {
            // Java
            seedAssessmentQuestionIfMissing(sJava, "Rate your practical experience with Java object-oriented programming.", "SELF_REPORTED",
                "[{\"label\":\"Beginner\",\"description\":\"I know basic Java syntax and control flow\",\"value\":1}," +
                 "{\"label\":\"Basic\",\"description\":\"I can write classes, methods, and simple loops\",\"value\":2}," +
                 "{\"label\":\"Intermediate\",\"description\":\"I use Collections, Interfaces, Generics, and Exception handling\",\"value\":3}," +
                 "{\"label\":\"Advanced\",\"description\":\"I use Streams, Lambdas, Concurrency, and design patterns\",\"value\":4}]",
                null, 1, 1);

            seedAssessmentQuestionIfMissing(sJava, "What does the 'final' keyword mean when applied to a Java variable?", "KNOWLEDGE",
                "[{\"optionKey\":\"A\",\"text\":\"The variable can never be accessed\"}," +
                 "{\"optionKey\":\"B\",\"text\":\"The variable value cannot be reassigned after initialization\"}," +
                 "{\"optionKey\":\"C\",\"text\":\"The variable is shared across all threads\"}," +
                 "{\"optionKey\":\"D\",\"text\":\"The variable is stored in heap memory only\"}]",
                "B", 1, 2);

            // Spring Boot
            seedAssessmentQuestionIfMissing(sSpring, "Rate your experience with Spring Boot REST development.", "SELF_REPORTED",
                "[{\"label\":\"Never used it\",\"description\":\"I'm new to Spring Boot\",\"value\":1}," +
                 "{\"label\":\"Basic\",\"description\":\"I can create simple controllers and endpoints\",\"value\":2}," +
                 "{\"label\":\"Intermediate\",\"description\":\"I use JPA, Security, and service layers\",\"value\":3}," +
                 "{\"label\":\"Advanced\",\"description\":\"I build production microservices with custom configs\",\"value\":4}]",
                null, 2, 3);

            seedAssessmentQuestionIfMissing(sSpring, "Which Spring annotation marks a Java class as a REST Controller that returns JSON automatically?", "KNOWLEDGE",
                "[{\"optionKey\":\"A\",\"text\":\"@Controller\"}," +
                 "{\"optionKey\":\"B\",\"text\":\"@RestController\"}," +
                 "{\"optionKey\":\"C\",\"text\":\"@Service\"}," +
                 "{\"optionKey\":\"D\",\"text\":\"@Repository\"}]",
                "B", 2, 4);

            seedAssessmentQuestionIfMissing(sSpring, "What is the purpose of the @Transactional annotation in Spring?", "KNOWLEDGE",
                "[{\"optionKey\":\"A\",\"text\":\"It marks a method to run asynchronously in a new thread\"}," +
                 "{\"optionKey\":\"B\",\"text\":\"It ensures a method runs within a database transaction, rolling back on exception\"}," +
                 "{\"optionKey\":\"C\",\"text\":\"It caches the return value of a method\"}," +
                 "{\"optionKey\":\"D\",\"text\":\"It validates request body parameters automatically\"}]",
                "B", 3, 5);

            // SQL
            seedAssessmentQuestionIfMissing(sSql, "Rate your SQL and PostgreSQL experience level.", "SELF_REPORTED",
                "[{\"label\":\"Beginner\",\"description\":\"I know SELECT, INSERT, UPDATE, DELETE basics\",\"value\":1}," +
                 "{\"label\":\"Basic\",\"description\":\"I can write JOINs and use WHERE conditions\",\"value\":2}," +
                 "{\"label\":\"Intermediate\",\"description\":\"I use GROUP BY, HAVING, subqueries, and indexes\",\"value\":3}," +
                 "{\"label\":\"Advanced\",\"description\":\"I design schemas, optimize queries, and use window functions\",\"value\":4}]",
                null, 1, 6);

            seedAssessmentQuestionIfMissing(sSql, "What SQL clause is used to filter aggregated group results?", "KNOWLEDGE",
                "[{\"optionKey\":\"A\",\"text\":\"WHERE\"}," +
                 "{\"optionKey\":\"B\",\"text\":\"ORDER BY\"}," +
                 "{\"optionKey\":\"C\",\"text\":\"HAVING\"}," +
                 "{\"optionKey\":\"D\",\"text\":\"JOIN\"}]",
                "C", 2, 7);

            // React
            seedAssessmentQuestionIfMissing(sReact, "Rate your React.js development experience.", "SELF_REPORTED",
                "[{\"label\":\"Beginner\",\"description\":\"I know basic JSX and functional components\",\"value\":1}," +
                 "{\"label\":\"Basic\",\"description\":\"I use useState and props effectively\",\"value\":2}," +
                 "{\"label\":\"Intermediate\",\"description\":\"I use useEffect, Context API, and routing\",\"value\":3}," +
                 "{\"label\":\"Advanced\",\"description\":\"I optimize performance with useMemo, useCallback, and lazy loading\",\"value\":4}]",
                null, 1, 8);

            seedAssessmentQuestionIfMissing(sReact, "Which React Hook is used to perform side effects like fetching data or DOM updates?", "KNOWLEDGE",
                "[{\"optionKey\":\"A\",\"text\":\"useState\"}," +
                 "{\"optionKey\":\"B\",\"text\":\"useEffect\"}," +
                 "{\"optionKey\":\"C\",\"text\":\"useContext\"}," +
                 "{\"optionKey\":\"D\",\"text\":\"useMemo\"}]",
                "B", 2, 9);

            seedAssessmentQuestionIfMissing(sReact, "What is the purpose of the 'key' prop when rendering lists in React?", "KNOWLEDGE",
                "[{\"optionKey\":\"A\",\"text\":\"It styles the list item with a unique CSS class\"}," +
                 "{\"optionKey\":\"B\",\"text\":\"It helps React identify which items changed, were added, or removed\"}," +
                 "{\"optionKey\":\"C\",\"text\":\"It prevents the component from re-rendering\"}," +
                 "{\"optionKey\":\"D\",\"text\":\"It passes data to child components automatically\"}]",
                "B", 2, 10);

            // Docker
            seedAssessmentQuestionIfMissing(sDocker, "Rate your Docker and containerization experience.", "SELF_REPORTED",
                "[{\"label\":\"Beginner\",\"description\":\"I know what Docker is but haven't used it much\",\"value\":1}," +
                 "{\"label\":\"Basic\",\"description\":\"I can run containers and write simple Dockerfiles\",\"value\":2}," +
                 "{\"label\":\"Intermediate\",\"description\":\"I use Docker Compose and multi-stage builds\",\"value\":3}," +
                 "{\"label\":\"Advanced\",\"description\":\"I manage Kubernetes clusters and Helm charts\",\"value\":4}]",
                null, 1, 11);

            seedAssessmentQuestionIfMissing(sDocker, "What command runs containers in detached mode using Docker Compose?", "KNOWLEDGE",
                "[{\"optionKey\":\"A\",\"text\":\"docker compose up -d\"}," +
                 "{\"optionKey\":\"B\",\"text\":\"docker run -detach\"}," +
                 "{\"optionKey\":\"C\",\"text\":\"docker compose start\"}," +
                 "{\"optionKey\":\"D\",\"text\":\"docker build -d\"}]",
                "A", 2, 12);

            // Python
            seedAssessmentQuestionIfMissing(sPython, "Rate your Python programming experience.", "SELF_REPORTED",
                "[{\"label\":\"Beginner\",\"description\":\"I know basic syntax and control structures\",\"value\":1}," +
                 "{\"label\":\"Basic\",\"description\":\"I can work with functions, lists, and dicts\",\"value\":2}," +
                 "{\"label\":\"Intermediate\",\"description\":\"I use OOP, file I/O, and common libraries\",\"value\":3}," +
                 "{\"label\":\"Advanced\",\"description\":\"I build production APIs, data pipelines, and packages\",\"value\":4}]",
                null, 1, 13);

            seedAssessmentQuestionIfMissing(sPython, "Which Python library is primarily used for DataFrame manipulation and data analysis?", "KNOWLEDGE",
                "[{\"optionKey\":\"A\",\"text\":\"NumPy\"}," +
                 "{\"optionKey\":\"B\",\"text\":\"Matplotlib\"}," +
                 "{\"optionKey\":\"C\",\"text\":\"Pandas\"}," +
                 "{\"optionKey\":\"D\",\"text\":\"SciPy\"}]",
                "C", 1, 14);

            // Machine Learning
            seedAssessmentQuestionIfMissing(sML, "Rate your Machine Learning knowledge and experience.", "SELF_REPORTED",
                "[{\"label\":\"Beginner\",\"description\":\"I understand what ML is conceptually\",\"value\":1}," +
                 "{\"label\":\"Basic\",\"description\":\"I've trained models with scikit-learn or tutorials\",\"value\":2}," +
                 "{\"label\":\"Intermediate\",\"description\":\"I can select, train, tune, and evaluate models\",\"value\":3}," +
                 "{\"label\":\"Advanced\",\"description\":\"I build and deploy production ML systems end-to-end\",\"value\":4}]",
                null, 2, 15);

            seedAssessmentQuestionIfMissing(sML, "What is overfitting in a machine learning model?", "KNOWLEDGE",
                "[{\"optionKey\":\"A\",\"text\":\"When the model performs better on training data than test data\"}," +
                 "{\"optionKey\":\"B\",\"text\":\"When the model uses too little data for training\"}," +
                 "{\"optionKey\":\"C\",\"text\":\"When the model is too simple to capture patterns\"}," +
                 "{\"optionKey\":\"D\",\"text\":\"When the training process takes too long\"}]",
                "A", 2, 16);

            // AWS
            seedAssessmentQuestionIfMissing(sAWS, "Rate your AWS Cloud experience.", "SELF_REPORTED",
                "[{\"label\":\"Beginner\",\"description\":\"I know what AWS is but rarely use it\",\"value\":1}," +
                 "{\"label\":\"Basic\",\"description\":\"I've used EC2, S3, and basic IAM\",\"value\":2}," +
                 "{\"label\":\"Intermediate\",\"description\":\"I deploy apps using RDS, Lambda, and VPC\",\"value\":3}," +
                 "{\"label\":\"Advanced\",\"description\":\"I architect multi-region, highly available AWS systems\",\"value\":4}]",
                null, 2, 17);

            // TypeScript
            seedAssessmentQuestionIfMissing(sTS, "Rate your TypeScript experience.", "SELF_REPORTED",
                "[{\"label\":\"Beginner\",\"description\":\"I know basic types and interfaces\",\"value\":1}," +
                 "{\"label\":\"Basic\",\"description\":\"I type functions, objects, and props\",\"value\":2}," +
                 "{\"label\":\"Intermediate\",\"description\":\"I use generics, union types, and utility types\",\"value\":3}," +
                 "{\"label\":\"Advanced\",\"description\":\"I write complex type-safe systems and library typings\",\"value\":4}]",
                null, 1, 18);

            seedAssessmentQuestionIfMissing(sTS, "What does the TypeScript 'interface' keyword define?", "KNOWLEDGE",
                "[{\"optionKey\":\"A\",\"text\":\"A class that cannot be instantiated directly\"}," +
                 "{\"optionKey\":\"B\",\"text\":\"A contract describing the shape of an object\"}," +
                 "{\"optionKey\":\"C\",\"text\":\"An async function definition\"}," +
                 "{\"optionKey\":\"D\",\"text\":\"A module import declaration\"}]",
                "B", 1, 19);
        }

        // Additional assessment questions for career-required skills that previously
        // had none (CSS, Git, Linux, Terraform, Kafka, Redis). Without a question,
        // AssessmentService can never record a real UserSkill level for these
        // skills, which in turn breaks the skill-gap calculation that the
        // personalized roadmap relies on. Added idempotently per-skill so this
        // also backfills databases that were already seeded with the original 19.
        seedAssessmentQuestionIfMissing(sCSS, "Rate your CSS & Tailwind styling experience.", "SELF_REPORTED",
            "[{\"label\":\"Beginner\",\"description\":\"I know basic selectors and properties\",\"value\":1}," +
             "{\"label\":\"Basic\",\"description\":\"I can build simple responsive layouts\",\"value\":2}," +
             "{\"label\":\"Intermediate\",\"description\":\"I use Flexbox, Grid, and utility frameworks like Tailwind\",\"value\":3}," +
             "{\"label\":\"Advanced\",\"description\":\"I build design systems, animations, and pixel-perfect responsive UIs\",\"value\":4}]",
            null, 1, 20);
        seedAssessmentQuestionIfMissing(sCSS, "Which CSS layout system is best suited for two-dimensional (row AND column) layouts?", "KNOWLEDGE",
            "[{\"optionKey\":\"A\",\"text\":\"Flexbox\"}," +
             "{\"optionKey\":\"B\",\"text\":\"CSS Grid\"}," +
             "{\"optionKey\":\"C\",\"text\":\"Float\"}," +
             "{\"optionKey\":\"D\",\"text\":\"Table layout\"}]",
            "B", 2, 21);

        seedAssessmentQuestionIfMissing(sGit, "Rate your Git & GitHub version control experience.", "SELF_REPORTED",
            "[{\"label\":\"Beginner\",\"description\":\"I know how to commit and push basic changes\",\"value\":1}," +
             "{\"label\":\"Basic\",\"description\":\"I use branches and can resolve simple merge conflicts\",\"value\":2}," +
             "{\"label\":\"Intermediate\",\"description\":\"I use pull requests, rebasing, and code review workflows\",\"value\":3}," +
             "{\"label\":\"Advanced\",\"description\":\"I manage branching strategies and CI workflows for a team\",\"value\":4}]",
            null, 1, 22);
        seedAssessmentQuestionIfMissing(sGit, "Which Git command creates a new branch and switches to it in a single step?", "KNOWLEDGE",
            "[{\"optionKey\":\"A\",\"text\":\"git commit -b feature\"}," +
             "{\"optionKey\":\"B\",\"text\":\"git checkout -b feature\"}," +
             "{\"optionKey\":\"C\",\"text\":\"git merge -b feature\"}," +
             "{\"optionKey\":\"D\",\"text\":\"git push -b feature\"}]",
            "B", 2, 23);

        seedAssessmentQuestionIfMissing(sLinux, "Rate your Linux system administration & Bash scripting experience.", "SELF_REPORTED",
            "[{\"label\":\"Beginner\",\"description\":\"I know basic navigation commands\",\"value\":1}," +
             "{\"label\":\"Basic\",\"description\":\"I can manage files, permissions, and processes\",\"value\":2}," +
             "{\"label\":\"Intermediate\",\"description\":\"I write Bash scripts and manage services with systemd\",\"value\":3}," +
             "{\"label\":\"Advanced\",\"description\":\"I administer production servers and automate operations\",\"value\":4}]",
            null, 1, 24);
        seedAssessmentQuestionIfMissing(sLinux, "Which command shows real-time system resource usage (CPU, memory) in Linux?", "KNOWLEDGE",
            "[{\"optionKey\":\"A\",\"text\":\"ls -la\"}," +
             "{\"optionKey\":\"B\",\"text\":\"top\"}," +
             "{\"optionKey\":\"C\",\"text\":\"chmod\"}," +
             "{\"optionKey\":\"D\",\"text\":\"grep\"}]",
            "B", 2, 25);

        seedAssessmentQuestionIfMissing(sTerraform, "Rate your Terraform & Infrastructure as Code experience.", "SELF_REPORTED",
            "[{\"label\":\"Beginner\",\"description\":\"I know what IaC is but haven't written any Terraform\",\"value\":1}," +
             "{\"label\":\"Basic\",\"description\":\"I can write simple resource blocks and apply them\",\"value\":2}," +
             "{\"label\":\"Intermediate\",\"description\":\"I use variables, modules, and remote state\",\"value\":3}," +
             "{\"label\":\"Advanced\",\"description\":\"I manage multi-environment infrastructure with reusable modules\",\"value\":4}]",
            null, 1, 26);
        seedAssessmentQuestionIfMissing(sTerraform, "Which Terraform command shows the execution plan without applying any changes?", "KNOWLEDGE",
            "[{\"optionKey\":\"A\",\"text\":\"terraform apply\"}," +
             "{\"optionKey\":\"B\",\"text\":\"terraform plan\"}," +
             "{\"optionKey\":\"C\",\"text\":\"terraform init\"}," +
             "{\"optionKey\":\"D\",\"text\":\"terraform destroy\"}]",
            "B", 2, 27);

        seedAssessmentQuestionIfMissing(sKafka, "Rate your Apache Kafka event-streaming experience.", "SELF_REPORTED",
            "[{\"label\":\"Beginner\",\"description\":\"I understand the concept of event streaming\",\"value\":1}," +
             "{\"label\":\"Basic\",\"description\":\"I've produced and consumed messages from a topic\",\"value\":2}," +
             "{\"label\":\"Intermediate\",\"description\":\"I design topics, partitions, and consumer groups\",\"value\":3}," +
             "{\"label\":\"Advanced\",\"description\":\"I operate production Kafka clusters and event-driven architectures\",\"value\":4}]",
            null, 2, 28);
        seedAssessmentQuestionIfMissing(sKafka, "In Kafka, what is the primary unit of parallelism within a topic?", "KNOWLEDGE",
            "[{\"optionKey\":\"A\",\"text\":\"Broker\"}," +
             "{\"optionKey\":\"B\",\"text\":\"Partition\"}," +
             "{\"optionKey\":\"C\",\"text\":\"Zookeeper node\"}," +
             "{\"optionKey\":\"D\",\"text\":\"Consumer group\"}]",
            "B", 2, 29);

        seedAssessmentQuestionIfMissing(sRedis, "Rate your Redis caching & in-memory data store experience.", "SELF_REPORTED",
            "[{\"label\":\"Beginner\",\"description\":\"I know Redis is a key-value store but haven't used it\",\"value\":1}," +
             "{\"label\":\"Basic\",\"description\":\"I can set/get keys and basic expirations\",\"value\":2}," +
             "{\"label\":\"Intermediate\",\"description\":\"I use Redis for caching, sessions, and pub/sub\",\"value\":3}," +
             "{\"label\":\"Advanced\",\"description\":\"I design caching strategies and rate limiters for production systems\",\"value\":4}]",
            null, 1, 30);
        seedAssessmentQuestionIfMissing(sRedis, "Which Redis command sets a key's expiration time in seconds?", "KNOWLEDGE",
            "[{\"optionKey\":\"A\",\"text\":\"SET\"}," +
             "{\"optionKey\":\"B\",\"text\":\"EXPIRE\"}," +
             "{\"optionKey\":\"C\",\"text\":\"TTL\"}," +
             "{\"optionKey\":\"D\",\"text\":\"DEL\"}]",
            "B", 2, 31);

        // ===================== COURSES & LESSONS =====================
        Course c1 = seedCourse("Java & Spring Boot Core", "Engineering",
                "Master enterprise Java 17, Spring Boot 3 microservice fundamentals, REST APIs, and Spring Data JPA from scratch to production.", "Intermediate", 12, 4.8, 342);
        seedLesson(c1, "Java OOP & Spring Boot Setup", 1,
                "### Welcome to Java & Spring Boot Core\n\nIn this lesson, we cover Spring Boot 3 initialization using Spring Initializr, project structure, and dependency injection using `@Autowired` and constructor injection.\n\n```java\n@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n    }\n}\n```\n\n**What you'll learn:**\n- How Spring Boot auto-configuration works\n- Project structure best practices\n- Dependency Injection (DI) and IoC container\n- Creating your first Spring Bean", 15);
        seedLesson(c1, "REST APIs & Controller Mapping", 2,
                "### Creating RESTful Endpoints\n\nLearn how to map HTTP GET, POST, PUT, DELETE requests using `@RestController`, `@GetMapping`, and `@PostMapping`.\n\n```java\n@RestController\n@RequestMapping(\"/api/users\")\npublic class UserController {\n    @GetMapping\n    public List<User> getAllUsers() {\n        return userService.findAll();\n    }\n    \n    @PostMapping\n    public ResponseEntity<User> createUser(@RequestBody CreateUserDto dto) {\n        User saved = userService.create(dto);\n        return ResponseEntity.status(201).body(saved);\n    }\n}\n```\n\n**Topics covered:**\n- Path variables and request parameters\n- Request body validation with @Valid\n- HTTP status codes best practices\n- Exception handling with @ControllerAdvice", 20);
        seedLesson(c1, "Spring Data JPA & Database Integration", 3,
                "### Persisting Data with JPA\n\nLearn to define JPA entities, repositories, and run JPQL queries.\n\n```java\n@Entity\n@Table(name = \"users\")\npublic class User {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    \n    @Column(nullable = false, unique = true)\n    private String email;\n}\n\npublic interface UserRepository extends JpaRepository<User, Long> {\n    Optional<User> findByEmail(String email);\n}\n```\n\n**Covered in this lesson:**\n- Entity relationships: @OneToMany, @ManyToOne\n- Repository pattern with Spring Data\n- JPQL custom queries\n- Pagination and Sorting", 25);
        seedLesson(c1, "Spring Security & JWT Authentication", 4,
                "### Securing Spring Boot APIs\n\nImplement JWT-based authentication and role-based access control.\n\n```java\n@Configuration\npublic class SecurityConfig {\n    @Bean\n    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {\n        return http\n            .csrf().disable()\n            .authorizeHttpRequests()\n            .requestMatchers(\"/api/auth/**\").permitAll()\n            .anyRequest().authenticated()\n            .and().sessionManagement()\n            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)\n            .and().build();\n    }\n}\n```\n\n**Topics:**\n- JWT token generation and validation\n- Spring Security filter chain\n- Role-based authorization (@PreAuthorize)\n- Password encoding with BCrypt", 30);

        Course c2 = seedCourse("SQL & PostgreSQL Masterclass", "Database",
                "Master relational database modeling, complex joins, window functions, indexing strategies, and Spring Data JPA integration.", "Beginner", 8, 4.9, 521);
        seedLesson(c2, "SQL Queries, JOINs, and Filters", 1,
                "### Relational Query Fundamentals\n\nUnderstanding `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN` and filtering strategies for high-performance queries.\n\n```sql\nSELECT u.name, c.title, e.progress\nFROM users u\nINNER JOIN enrollments e ON u.id = e.user_id\nINNER JOIN courses c ON e.course_id = c.id\nWHERE e.progress > 50\nORDER BY e.progress DESC;\n```\n\n**Covered:**\n- SELECT, WHERE, ORDER BY, LIMIT\n- INNER, LEFT, RIGHT, FULL OUTER JOINs\n- Subqueries and CTEs\n- Null handling with COALESCE", 25);
        seedLesson(c2, "Aggregations, GROUP BY & HAVING", 2,
                "### Aggregating Data\n\nLearn COUNT, SUM, AVG, MIN, MAX and how to filter groups with HAVING.\n\n```sql\nSELECT category, COUNT(*) as course_count, AVG(rating) as avg_rating\nFROM courses\nWHERE published = true\nGROUP BY category\nHAVING COUNT(*) > 2\nORDER BY avg_rating DESC;\n```\n\n**Topics:**\n- Aggregate functions (COUNT, SUM, AVG, MIN, MAX)\n- GROUP BY clause\n- HAVING vs WHERE\n- Window functions: ROW_NUMBER(), RANK(), LAG()", 20);
        seedLesson(c2, "Indexes & Query Optimization", 3,
                "### Making Queries Fast\n\nLearn B-tree indexes, composite indexes, EXPLAIN ANALYZE, and optimization techniques.\n\n```sql\n-- Create an index on frequently queried columns\nCREATE INDEX idx_enrollments_user_id ON enrollments(user_id);\nCREATE INDEX idx_courses_category ON courses(category) WHERE published = true;\n\n-- Analyze query plan\nEXPLAIN ANALYZE\nSELECT * FROM courses WHERE category = 'Engineering';\n```\n\n**Topics:**\n- B-tree, Hash, and GIN indexes\n- EXPLAIN and EXPLAIN ANALYZE\n- Avoiding full table scans\n- Vacuum and autovacuum basics", 30);

        Course c3 = seedCourse("React & Modern Frontend Development", "Frontend",
                "Build production-grade React applications with hooks, TypeScript, performance optimization, and modern CSS techniques.", "Beginner", 10, 4.7, 689);
        seedLesson(c3, "React Components & JSX Basics", 1,
                "### Your First React Component\n\nLearn functional components, JSX syntax, and how React renders to the DOM.\n\n```jsx\nfunction WelcomeCard({ name, role }) {\n  return (\n    <div className=\"card\">\n      <h2>Welcome, {name}!</h2>\n      <span className=\"badge\">{role}</span>\n    </div>\n  );\n}\n\nexport default function App() {\n  return <WelcomeCard name=\"John\" role=\"Developer\" />;\n}\n```\n\n**Topics:**\n- Functional components and props\n- JSX rules and expressions\n- Conditional rendering\n- Lists and the key prop", 18);
        seedLesson(c3, "State Management with Hooks", 2,
                "### useState & useEffect Deep Dive\n\nManage component state and side effects with React hooks.\n\n```jsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  useEffect(() => {\n    document.title = `Count: ${count}`;\n    return () => { document.title = 'SkillHub'; }; // cleanup\n  }, [count]); // runs when count changes\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>+</button>\n    </div>\n  );\n}\n```\n\n**Topics:**\n- useState with complex objects\n- useEffect dependencies and cleanup\n- useRef and useCallback\n- Custom hooks for reusability", 22);
        seedLesson(c3, "React Router & API Integration", 3,
                "### Routing & Fetching Data\n\nBuild multi-page SPAs with React Router and integrate REST APIs.\n\n```jsx\nimport { useEffect, useState } from 'react';\nimport { useParams } from 'react-router-dom';\n\nfunction CourseDetail() {\n  const { id } = useParams();\n  const [course, setCourse] = useState(null);\n  \n  useEffect(() => {\n    fetch(`/api/courses/${id}`)\n      .then(r => r.json())\n      .then(setCourse);\n  }, [id]);\n  \n  if (!course) return <div>Loading...</div>;\n  return <h1>{course.title}</h1>;\n}\n```\n\n**Topics:**\n- React Router v6 routes and navigation\n- useParams, useNavigate, useSearchParams\n- Async data fetching patterns\n- Error boundaries and loading states", 25);

        Course c4 = seedCourse("Docker & Kubernetes in Production", "DevOps",
                "Package, deploy, and orchestrate containerized applications with Docker, Docker Compose, and Kubernetes.", "Intermediate", 8, 4.6, 287);
        seedLesson(c4, "Docker Fundamentals & Dockerfile", 1,
                "### Containerizing Applications\n\nWrite optimized Dockerfiles for Java Spring Boot and React applications.\n\n```dockerfile\n# Multi-stage build for Spring Boot\nFROM eclipse-temurin:17-jdk-alpine AS builder\nWORKDIR /app\nCOPY . .\nRUN ./mvnw package -DskipTests\n\nFROM eclipse-temurin:17-jre-alpine\nWORKDIR /app\nCOPY --from=builder /app/target/*.jar app.jar\nEXPOSE 8080\nENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]\n```\n\n**Topics:**\n- Docker images, containers, and registries\n- Multi-stage builds for smaller images\n- Docker networking and volumes\n- Environment variables and secrets", 20);
        seedLesson(c4, "Docker Compose for Multi-Service Apps", 2,
                "### Orchestrating Services Locally\n\nRun full application stacks with Docker Compose.\n\n```yaml\nservices:\n  backend:\n    build: ./backend\n    ports: [\"8080:8080\"]\n    environment:\n      - DB_URL=jdbc:postgresql://db:5432/skillhub\n    depends_on: [db]\n    \n  frontend:\n    build: ./frontend\n    ports: [\"3000:80\"]\n    \n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_PASSWORD: secret\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n      \nvolumes:\n  pgdata:\n```\n\n**Topics:**\n- Service dependencies and health checks\n- Networking between containers\n- Persistent volumes\n- Environment files (.env)", 25);
        seedLesson(c4, "Kubernetes Pods, Deployments & Services", 3,
                "### Deploying to Kubernetes\n\nLearn K8s core concepts and deploy your first application.\n\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: backend-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: backend\n  template:\n    spec:\n      containers:\n      - name: backend\n        image: skillhub/backend:latest\n        ports:\n        - containerPort: 8080\n        resources:\n          requests:\n            memory: \"256Mi\"\n            cpu: \"250m\"\n```\n\n**Topics:**\n- Pods, Deployments, and ReplicaSets\n- Services (ClusterIP, NodePort, LoadBalancer)\n- ConfigMaps and Secrets\n- Rolling updates and rollbacks", 30);

        Course c5 = seedCourse("Python for Data Analysis", "Data",
                "Learn Python data analysis from scratch using Pandas, NumPy, and Matplotlib to extract insights from real datasets.", "Beginner", 9, 4.8, 445);
        seedLesson(c5, "Python Essentials for Data Work", 1,
                "### Python Data Foundations\n\nMaster Python fundamentals needed for data analysis — lists, dicts, comprehensions, and file I/O.\n\n```python\n# Working with data structures\nstudents = [\n    {\"name\": \"Alice\", \"score\": 95},\n    {\"name\": \"Bob\",   \"score\": 72},\n    {\"name\": \"Carol\", \"score\": 88},\n]\n\n# List comprehension to filter and transform\nhigh_scorers = [s[\"name\"] for s in students if s[\"score\"] >= 90]\nprint(high_scorers)  # ['Alice']\n\n# Reading CSV files\nwith open(\"data.csv\", \"r\") as f:\n    for line in f:\n        print(line.strip().split(\",\"))\n```\n\n**Topics:**\n- Lists, tuples, dicts, and sets\n- List/dict comprehensions\n- File I/O and CSV handling\n- Functions and lambdas", 20);
        seedLesson(c5, "Pandas: DataFrames & Data Cleaning", 2,
                "### Mastering Pandas\n\nLoad, clean, filter, and transform data with Pandas DataFrames.\n\n```python\nimport pandas as pd\n\ndf = pd.read_csv(\"courses.csv\")\n\n# Explore the data\nprint(df.shape)       # (100, 8)\nprint(df.head())\nprint(df.info())\nprint(df.describe())\n\n# Data cleaning\ndf = df.dropna(subset=[\"rating\"])        # Remove rows with missing ratings\ndf[\"category\"] = df[\"category\"].str.strip().str.lower()  # Normalize strings\ndf[\"duration_hours\"] = df[\"duration_hours\"].fillna(df[\"duration_hours\"].median())\n\n# Filtering and aggregation\nhigh_rated = df[df[\"rating\"] > 4.5]\nby_category = df.groupby(\"category\")[\"rating\"].mean().sort_values(ascending=False)\nprint(by_category)\n```\n\n**Topics:**\n- DataFrame creation and inspection\n- Handling null values\n- Filtering, sorting, and groupby\n- Merging and joining DataFrames", 25);
        seedLesson(c5, "Data Visualization with Matplotlib & Seaborn", 3,
                "### Visualizing Data Insights\n\nCreate line plots, bar charts, scatter plots, and heatmaps to communicate data insights.\n\n```python\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Set plot style\nsns.set_theme(style=\"darkgrid\")\nplt.figure(figsize=(10, 6))\n\n# Scatter plot with regression line\nsns.scatterplot(data=df, x=\"duration_hours\", y=\"rating\", hue=\"category\", s=100)\nplt.title(\"Course Duration vs Rating by Category\")\nplt.xlabel(\"Duration (Hours)\")\nplt.ylabel(\"Rating (1-5)\")\nplt.tight_layout()\nplt.savefig(\"chart.png\")\n```\n\n**Topics:**\n- Line charts, bar charts, and histograms\n- Seaborn pairplots and correlation heatmaps\n- Customizing axes, labels, legends, and colors\n- Exporting high-resolution figures", 25);

        Course c6 = seedCourse("Machine Learning Foundations", "Data",
                "Build your first ML models using scikit-learn — from data preprocessing to model evaluation and hyperparameter tuning.", "Intermediate", 12, 4.9, 312);
        seedLesson(c6, "ML Concepts & The Model Lifecycle", 1,
                "### How Machine Learning Works\n\nUnderstand supervised vs unsupervised learning, and the complete ML workflow from data to deployment.\n\n```python\nfrom sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\n\n# Load dataset\nX, y = load_iris(return_X_y=True)\n\n# Split data\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\n# Normalize features\nscaler = StandardScaler()\nX_train = scaler.fit_transform(X_train)\nX_test  = scaler.transform(X_test)\n```\n\n**Topics:**\n- Supervised vs unsupervised learning\n- Regression vs classification\n- Train/validation/test splits\n- Feature scaling and normalization", 25);
        seedLesson(c6, "Training & Evaluating Classification Models", 2,
                "### Building Your First Classifier\n\nTrain Decision Trees, Random Forests, and evaluate model performance.\n\n```python\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score, classification_report\n\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)\n\ny_pred = model.predict(X_test)\nprint(f\"Accuracy: {accuracy_score(y_test, y_pred):.2%}\")\nprint(classification_report(y_test, y_pred))\n\n# Feature importance\nimportances = pd.Series(model.feature_importances_, index=feature_names)\nprint(importances.sort_values(ascending=False))\n```\n\n**Topics:**\n- Decision Trees and Random Forests\n- Confusion matrix, precision, recall, F1\n- Cross-validation (k-fold)\n- Hyperparameter tuning with GridSearchCV", 30);
        seedLesson(c6, "Model Deployment & API Integration", 3,
                "### Serving ML Models in Production\n\nSerialize trained models using Joblib and serve predictions via FastAPI.\n\n```python\nimport joblib\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\n# Save model\njoblib.dump(model, \"classifier.joblib\")\n\n# FastAPI server\napp = FastAPI()\nloaded_model = joblib.load(\"classifier.joblib\")\n\nclass PredictRequest(BaseModel):\n    features: list[float]\n\n@app.post(\"/predict\")\ndef predict(req: PredictRequest):\n    prediction = loaded_model.predict([req.features])\n    return {\"prediction\": int(prediction[0])}\n```\n\n**Topics:**\n- Model serialization (Joblib / Pickle)\n- REST endpoint creation with FastAPI\n- Request validation with Pydantic\n- Dockerizing an ML inference server", 25);

        Course c7 = seedCourse("AWS Cloud Fundamentals", "Cloud",
                "Get hands-on with AWS core services: EC2, S3, RDS, Lambda, IAM, and deploy a full application stack to the cloud.", "Beginner", 10, 4.7, 198);
        seedLesson(c7, "AWS Core Services Overview", 1,
                "### Your First Steps on AWS\n\nUnderstand the AWS global infrastructure and core services needed for modern application deployment.\n\n**AWS Service Categories:**\n- **Compute**: EC2 (virtual machines), Lambda (serverless), ECS (containers)\n- **Storage**: S3 (object storage), EBS (block storage), EFS (file storage)\n- **Database**: RDS (managed SQL), DynamoDB (NoSQL), ElastiCache (Redis)\n- **Networking**: VPC, Route 53, CloudFront, ALB\n- **Security**: IAM, KMS, Secrets Manager, WAF\n\n```bash\n# AWS CLI basics\naws configure  # Set up credentials\naws s3 ls      # List S3 buckets\naws ec2 describe-instances --region ap-southeast-1  # List EC2 instances\n```\n\n**Topics:**\n- AWS global regions and availability zones\n- IAM users, roles, and policies\n- EC2 instance types and pricing\n- S3 bucket creation and access control", 20);
        seedLesson(c7, "Deploying a Spring Boot App to AWS", 2,
                "### Production Deployment on AWS\n\nDeploy a Spring Boot backend with RDS PostgreSQL and S3 file storage.\n\n```bash\n# Launch EC2 instance\naws ec2 run-instances \\\n  --image-id ami-0df7a207adb9748c7 \\\n  --instance-type t3.medium \\\n  --key-name my-keypair \\\n  --security-group-ids sg-0abc123\n\n# Create RDS PostgreSQL instance  \naws rds create-db-instance \\\n  --db-instance-identifier skillhub-db \\\n  --db-instance-class db.t3.micro \\\n  --engine postgres \\\n  --master-username postgres \\\n  --master-user-password secret123\n```\n\n**Topics:**\n- EC2 user-data scripts for auto-setup\n- RDS database creation and connection\n- S3 file upload from Spring Boot\n- Application Load Balancer setup\n- Auto Scaling Groups", 30);
        seedLesson(c7, "Serverless Applications with AWS Lambda & API Gateway", 3,
                "### Building Serverless Backends\n\nBuild event-driven serverless APIs with AWS Lambda and API Gateway.\n\n```json\n{\n  \"AWSTemplateFormatVersion\": \"2010-09-09\",\n  \"Transform\": \"AWS::Serverless-2016-10-31\",\n  \"Resources\": {\n    \"GetCoursesFunction\": {\n      \"Type\": \"AWS::Serverless::Function\",\n      \"Properties\": {\n        \"Handler\": \"index.handler\",\n        \"Runtime\": \"nodejs18.x\",\n        \"CodeUri\": \"./src\",\n        \"Events\": {\n          \"GetCourses\": {\n            \"Type\": \"Api\",\n            \"Properties\": { \"Path\": \"/courses\", \"Method\": \"get\" }\n          }\n        }\n      }\n    }\n  }\n}\n```\n\n**Topics:**\n- Serverless architecture principles\n- AWS Lambda execution environment\n- API Gateway integration\n- SAM (Serverless Application Model) CLI", 25);

        Course c8 = seedCourse("TypeScript & Modern JavaScript", "Frontend",
                "Level up from JavaScript to TypeScript — master static typing, generics, interfaces, and advanced patterns.", "Beginner", 6, 4.6, 534);
        seedLesson(c8, "TypeScript Basics: Types & Interfaces", 1,
                "### Why TypeScript?\n\nTypeScript adds static typing to JavaScript, catching errors at compile time rather than runtime.\n\n```typescript\n// JavaScript (runtime error possible)\nfunction greet(user) {\n  return `Hello, ${user.nam}!`; // typo: 'nam' instead of 'name'\n}\n\n// TypeScript (compile-time error caught!)\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n  role: 'admin' | 'user' | 'guest'; // union type\n}\n\nfunction greet(user: User): string {\n  return `Hello, ${user.name}!`; // ✅ TypeScript catches the typo\n}\n```\n\n**Topics:**\n- Primitive types: string, number, boolean\n- Arrays, tuples, and enums\n- Interfaces vs type aliases\n- Optional and readonly properties", 18);
        seedLesson(c8, "Generics, Utility Types & Advanced Patterns", 2,
                "### Advanced TypeScript\n\nUse generics and utility types to write flexible, reusable code.\n\n```typescript\n// Generic function\nfunction findById<T extends { id: number }>(items: T[], id: number): T | undefined {\n  return items.find(item => item.id === id);\n}\n\n// Utility types\ntype CreateUserDto = Omit<User, 'id'>; // all User fields except id\ntype PartialUser = Partial<User>;       // all fields optional\ntype ReadonlyUser = Readonly<User>;     // all fields readonly\n\n// Mapped types\ntype ApiResponse<T> = {\n  data: T;\n  status: number;\n  message: string;\n};\n```\n\n**Topics:**\n- Generic functions and classes\n- Utility types: Partial, Required, Omit, Pick, Readonly\n- Conditional types\n- Type narrowing and type guards", 22);
        seedLesson(c8, "TypeScript with React & Axios", 3,
                "### Building Typed React Applications\n\nType React props, hooks, event handlers, and API responses.\n\n```tsx\nimport React, { useState, useEffect } from 'react';\n\ninterface CourseProps {\n  id: number;\n  title: string;\n  onSelect: (id: number) => void;\n}\n\nexport const CourseCard: React.FC<CourseProps> = ({ id, title, onSelect }) => {\n  const [liked, setLiked] = useState<boolean>(false);\n  return (\n    <div onClick={() => onSelect(id)}>\n      <h3>{title}</h3>\n      <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}>\n        {liked ? '❤️' : '🤍'}\n      </button>\n    </div>\n  );\n};\n```\n\n**Topics:**\n- Typing React functional components and props\n- Typing useState, useRef, and custom hooks\n- Form events and synthetic event types\n- Generic API client wrappers with Axios", 20);

        Course c9 = seedCourse("Linux & DevOps Fundamentals", "DevOps",
                "Master Linux system administration, shell scripting, and essential DevOps tools needed for any cloud or backend role.", "Beginner", 7, 4.5, 231);
        seedLesson(c9, "Linux Command Line Essentials", 1,
                "### Navigating the Linux Shell\n\nLearn the most important Linux commands for files, processes, and networking.\n\n```bash\n# File operations\nls -la /var/log              # List files with permissions\nfind / -name \"*.log\" -newer  # Find files\nchmod 755 script.sh          # Set permissions\nchown ubuntu:ubuntu file.txt # Change ownership\n\n# Process management\nps aux | grep java           # Find running processes\nkill -9 1234                 # Kill process by PID\ntop                          # Interactive process viewer\nhtop                         # Better top\n\n# Networking\ncurl -I https://example.com  # HTTP headers\nnetstat -tulpn               # Open ports\nssh user@192.168.1.100       # SSH connection\n```\n\n**Topics:**\n- File system structure and navigation\n- File permissions and ownership\n- Process management\n- Network diagnostics (curl, netstat, ss)", 20);
        seedLesson(c9, "Bash Scripting & Automation", 2,
                "### Automating with Bash\n\nWrite Bash scripts for automation, deployment, and monitoring tasks.\n\n```bash\n#!/bin/bash\nset -euo pipefail  # Exit on error, undefined vars, pipe failures\n\nAPP_NAME=\"skillhub-backend\"\nDEPLOY_DIR=\"/opt/${APP_NAME}\"\n\necho \"Starting deployment of ${APP_NAME}...\"\n\n# Check if service is running\nif systemctl is-active --quiet \"${APP_NAME}\"; then\n    echo \"Stopping existing service...\"\n    systemctl stop \"${APP_NAME}\"\nfi\n\n# Pull latest version\ncd \"${DEPLOY_DIR}\"\ngit pull origin main\n\n# Build and start\n./mvnw package -DskipTests\nsystemctl start \"${APP_NAME}\"\necho \"Deployment complete!\"\n```\n\n**Topics:**\n- Variables, conditionals, and loops\n- Functions and arguments\n- Error handling with set -e\n- Cron jobs for scheduled tasks\n- Practical deployment scripts", 25);
        seedLesson(c9, "System Observability & Log Analysis", 3,
                "### System Monitoring & Troubleshooting\n\nMonitor CPU, memory, disk I/O, and analyze system logs with grep, awk, and journalctl.\n\n```bash\n# Analyze access logs\nawk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 10\n\n# Systemd service logs\njournalctl -u skillhub-backend.service -n 100 --no-pager -f\n\n# Check disk space & memory\ndf -h\nfree -m\niostat -xz 1 5\n```\n\n**Topics:**\n- Log analysis using grep, awk, and sed\n- Systemd journalctl filtering\n- Disk space and memory management\n- Network traffic monitoring", 20);

        Course c10 = seedCourse("Node.js & Express REST APIs", "Backend",
                "Build fast, scalable REST APIs using Node.js, Express, MongoDB, and modern async JavaScript patterns.", "Intermediate", 8, 4.7, 389);
        seedLesson(c10, "Node.js & Express Server Setup", 1,
                "### Your First Express API\n\nSet up a production-ready Express server with routing, middleware, and error handling.\n\n```javascript\nconst express = require('express');\nconst cors = require('cors');\n\nconst app = express();\n\n// Middleware\napp.use(cors());\napp.use(express.json());\napp.use(express.urlencoded({ extended: true }));\n\n// Routes\napp.use('/api/users', require('./routes/users'));\napp.use('/api/courses', require('./routes/courses'));\n\n// Global error handler\napp.use((err, req, res, next) => {\n    console.error(err.stack);\n    res.status(err.status || 500).json({ message: err.message });\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));\n```\n\n**Topics:**\n- Express middleware and routing\n- Environment variables with dotenv\n- CORS configuration\n- Request validation with Joi\n- Async error handling", 20);
        seedLesson(c10, "MongoDB & Mongoose Data Modeling", 2,
                "### NoSQL Data with Mongoose\n\nModel and query MongoDB documents using Mongoose schemas and ODM patterns.\n\n```javascript\nconst mongoose = require('mongoose');\n\n// Define schema\nconst courseSchema = new mongoose.Schema({\n    title: { type: String, required: true, trim: true },\n    category: { type: String, enum: ['Backend', 'Frontend', 'Data', 'DevOps'] },\n    rating: { type: Number, default: 0, min: 0, max: 5 },\n    createdAt: { type: Date, default: Date.now },\n    enrollments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]\n});\n\n// Model methods\ncourseSchema.statics.findByCategory = function(cat) {\n    return this.find({ category: cat }).sort({ rating: -1 });\n};\n\nconst Course = mongoose.model('Course', courseSchema);\n\n// Query examples\nconst courses = await Course.findByCategory('Backend').limit(10);\nconst course = await Course.findById(id).populate('enrollments');\n```\n\n**Topics:**\n- Mongoose schemas and validation\n- CRUD operations\n- Query operators ($eq, $gte, $in)\n- Population and references\n- Aggregation pipeline", 25);
        seedLesson(c10, "JWT Auth & Middleware Security in Express", 3,
                "### Securing Express Applications\n\nImplement JWT authentication, password hashing with bcrypt, and security headers with Helmet.\n\n```javascript\nconst jwt = require('jsonwebtoken');\nconst bcrypt = require('bcryptjs');\nconst helmet = require('helmet');\n\n// Protect middleware\nconst protect = (req, res, next) => {\n    const token = req.headers.authorization?.split(' ')[1];\n    if (!token) return res.status(401).json({ message: 'Not authorized' });\n    \n    try {\n        const decoded = jwt.verify(token, process.env.JWT_SECRET);\n        req.user = decoded;\n        next();\n    } catch (e) {\n        res.status(401).json({ message: 'Token invalid' });\n    }\n};\n```\n\n**Topics:**\n- Password hashing with Bcrypt\n- JSON Web Token (JWT) sign and verify\n- Auth middleware protection\n- Security best practices (Helmet, rate-limiting)", 25);

        // Additional courses covering skills required by careers that previously had
        // no matching course (Git, Redis, Terraform, Kafka). Without these, the
        // RoadmapService could never recommend a course for a user's gap in these
        // skills for Backend/Frontend/FullStack/Mobile (Git), Backend (Redis),
        // DevOps/Cloud Architect (Terraform), and DevOps (Kafka).
        Course c11 = seedCourse("Git & GitHub for Team Collaboration", "Engineering",
                "Master version control with Git and collaborative workflows on GitHub — branching, pull requests, code review, and CI basics.", "Beginner", 4, 4.8, 410);
        seedLesson(c11, "Git Fundamentals: Commits, Branches & Merging", 1,
                "### Version Control Basics\n\nLearn how Git tracks changes and how to work with commits, branches, and merges.\n\n```bash\n# Initialize and make your first commit\ngit init\ngit add .\ngit commit -m \"Initial commit\"\n\n# Branching\ngit branch feature/login\ngit checkout -b feature/login   # create + switch in one step\n\n# Merging\ngit checkout main\ngit merge feature/login\n```\n\n**Topics:**\n- Working directory, staging area, and repository\n- Creating and switching branches\n- Merging and resolving conflicts\n- .gitignore and commit message conventions", 15);
        seedLesson(c11, "Collaborating with GitHub: PRs, Code Review & CI", 2,
                "### Team Workflows on GitHub\n\nLearn how teams collaborate using pull requests, code review, and automated checks.\n\n```bash\n# Push a feature branch and open a PR\ngit push origin feature/login\n\n# Keep your branch up to date with main\ngit fetch origin\ngit rebase origin/main\n```\n\n**Topics:**\n- Forking vs branching workflows\n- Writing good pull request descriptions\n- Code review etiquette and resolving feedback\n- Branch protection rules and GitHub Actions basics", 20);

        Course c12 = seedCourse("Redis for Caching & Real-Time Data", "Backend",
                "Use Redis to build fast caching layers, manage sessions, and implement pub/sub and rate limiting for production APIs.", "Intermediate", 5, 4.7, 205);
        seedLesson(c12, "Redis Data Structures & Core Commands", 1,
                "### Getting Started with Redis\n\nLearn Redis's core data structures and how to use them from an application.\n\n```bash\n# Strings, expiration, and hashes\nSET session:123 \"user-alice\" EX 3600\nGET session:123\nHSET user:1 name \"Alice\" role \"admin\"\nHGETALL user:1\n\n# Lists and sets\nLPUSH recent-searches \"spring boot\"\nSADD tags:course:1 \"java\" \"spring\"\n```\n\n**Topics:**\n- Strings, hashes, lists, sets, and sorted sets\n- Key expiration (EX/TTL) and eviction policies\n- Connecting from Spring Boot with Spring Data Redis\n- Basic pub/sub messaging", 20);
        seedLesson(c12, "Caching Strategies & Session Storage with Redis", 2,
                "### Building a Caching Layer\n\nApply cache-aside and write-through strategies, and use Redis for session storage and rate limiting.\n\n```java\n@Cacheable(value = \"courses\", key = \"#courseId\")\npublic CourseResponse getCourse(Long courseId) {\n    return courseRepository.findById(courseId)\n            .map(this::toResponse)\n            .orElseThrow();\n}\n\n// Simple rate limiter using INCR + EXPIRE\nLong count = redisTemplate.opsForValue().increment(\"rate:\" + userId);\nif (count == 1) {\n    redisTemplate.expire(\"rate:\" + userId, Duration.ofMinutes(1));\n}\n```\n\n**Topics:**\n- Cache-aside vs write-through caching\n- Spring Cache abstraction with Redis\n- Session storage for horizontally scaled apps\n- Rate limiting with INCR/EXPIRE", 25);

        Course c13 = seedCourse("Terraform: Infrastructure as Code", "Cloud",
                "Provision and manage cloud infrastructure reliably using Terraform — providers, resources, state, and reusable modules.", "Intermediate", 7, 4.8, 176);
        seedLesson(c13, "Terraform Basics: Providers, Resources & State", 1,
                "### Your First Terraform Configuration\n\nDefine cloud resources declaratively and understand how Terraform tracks state.\n\n```hcl\nterraform {\n  required_providers {\n    aws = { source = \"hashicorp/aws\", version = \"~> 5.0\" }\n  }\n}\n\nprovider \"aws\" {\n  region = \"ap-southeast-1\"\n}\n\nresource \"aws_instance\" \"app_server\" {\n  ami           = \"ami-0df7a207adb9748c7\"\n  instance_type = \"t3.medium\"\n  tags = { Name = \"skillhub-backend\" }\n}\n```\n\n```bash\nterraform init\nterraform plan\nterraform apply\n```\n\n**Topics:**\n- Providers, resources, and the Terraform lifecycle\n- terraform init / plan / apply / destroy\n- State files and remote state backends\n- Reading provider documentation", 30);
        seedLesson(c13, "Modules, Variables & Multi-Environment Deployments", 2,
                "### Reusable, Environment-Aware Infrastructure\n\nStructure Terraform code with variables, outputs, and modules to support dev/staging/prod environments.\n\n```hcl\nvariable \"environment\" {\n  type    = string\n  default = \"dev\"\n}\n\nmodule \"network\" {\n  source      = \"./modules/network\"\n  environment = var.environment\n  cidr_block  = \"10.0.0.0/16\"\n}\n\noutput \"vpc_id\" {\n  value = module.network.vpc_id\n}\n```\n\n**Topics:**\n- Input variables and outputs\n- Writing and reusing modules\n- Workspaces for multiple environments\n- Managing secrets safely with Terraform", 25);

        Course c14 = seedCourse("Apache Kafka for Event-Driven Systems", "Backend",
                "Design event-driven microservices with Apache Kafka — topics, partitions, producers, consumers, and delivery guarantees.", "Advanced", 6, 4.6, 142);
        seedLesson(c14, "Kafka Fundamentals: Topics, Producers & Consumers", 1,
                "### Event Streaming Basics\n\nUnderstand Kafka's core concepts and produce/consume your first messages.\n\n```java\n@KafkaListener(topics = \"course-events\", groupId = \"enrollment-service\")\npublic void handleCourseEvent(CourseEvent event) {\n    log.info(\"Received event: {}\", event);\n}\n\n// Producing a message\nkafkaTemplate.send(\"course-events\", courseId.toString(), new CourseEvent(\"ENROLLED\", courseId));\n```\n\n**Topics:**\n- Topics, partitions, and offsets\n- Producers, consumers, and consumer groups\n- At-least-once vs exactly-once delivery\n- Setting up a local Kafka broker with Docker Compose", 25);
        seedLesson(c14, "Building Event-Driven Microservices with Kafka", 2,
                "### Designing Reliable Event Pipelines\n\nUse Kafka to decouple microservices and handle failures gracefully.\n\n```java\n@Bean\npublic NewTopic courseEventsTopic() {\n    return TopicBuilder.name(\"course-events\")\n            .partitions(3)\n            .replicas(1)\n            .build();\n}\n\n// Dead-letter handling for failed messages\n@RetryableTopic(attempts = \"3\", dltStrategy = DltStrategy.FAIL_ON_ERROR)\n@KafkaListener(topics = \"course-events\")\npublic void process(CourseEvent event) { /* ... */ }\n```\n\n**Topics:**\n- Event-driven architecture patterns\n- Retry topics and dead-letter queues\n- Schema evolution basics (Avro/JSON)\n- Monitoring consumer lag", 30);

        // ===================== COURSE SKILLS & PREREQUISITES =====================
        seedCourseSkill(c1, sJava, 4);
        seedCourseSkill(c1, sSpring, 4);
        seedCourseSkill(c2, sSql, 3);
        seedCourseSkill(c3, sReact, 4);
        seedCourseSkill(c3, sCSS, 3);
        seedCourseSkill(c4, sDocker, 4);
        seedCourseSkill(c4, sLinux, 2);
        seedCourseSkill(c5, sPython, 3);
        seedCourseSkill(c6, sPython, 4);
        seedCourseSkill(c6, sML, 4);
        seedCourseSkill(c7, sAWS, 3);
        seedCourseSkill(c8, sTS, 3);
        seedCourseSkill(c9, sLinux, 3);
        seedCourseSkill(c10, sNodeJS, 3);
        seedCourseSkill(c10, sMongoDB, 3);
        seedCourseSkill(c11, sGit, 3);
        seedCourseSkill(c12, sRedis, 3);
        seedCourseSkill(c13, sTerraform, 4);
        seedCourseSkill(c14, sKafka, 2);

        // Prerequisites: logical learning order
        seedCoursePrerequisite(c1, c2);   // Spring Boot requires SQL basics
        seedCoursePrerequisite(c6, c5);   // ML requires Python basics
        seedCoursePrerequisite(c4, c9);   // Docker/K8s easier with Linux knowledge
        seedCoursePrerequisite(c3, c8);   // React easier with TypeScript knowledge

        // ===================== SKILL EXCHANGE PROJECTS =====================
        if (projectRepository.count() == 0) {
            Project p1 = seedProject(admin, "SkillHub E-Learning Platform",
                    "We are building microservice features, AI tutor integration, and real-time project collaboration tools. Looking for Spring Boot and React developers.",
                    "Web Development", "Intermediate", "4 Weeks", "2-4 hours/week", 5, "Recruiting",
                    List.of("Java", "Spring Boot", "React.js"));

            Project p2 = seedProject(alice, "AI Code Review Bot",
                    "Building an automated code analyzer using LLMs to scan pull requests for security vulnerabilities and code quality issues. Python and ML required.",
                    "Artificial Intelligence", "Advanced", "3 Weeks", "4-6 hours/week", 4, "Recruiting",
                    List.of("Python", "Machine Learning", "Docker & Kubernetes"));

            Project p3 = seedProject(bob, "Open Source DevOps Toolkit",
                    "Creating a Bash & Terraform toolkit to automate cloud infrastructure provisioning on AWS with sensible defaults for small teams.",
                    "Cloud & DevOps", "Intermediate", "6 Weeks", "3-5 hours/week", 6, "Recruiting",
                    List.of("Terraform", "AWS Cloud", "Linux & Bash"));

            if (joinRequestRepository.count() == 0) {
                JoinRequest req = JoinRequest.builder()
                        .project(p2)
                        .applicant(user)
                        .skills(List.of("Python", "Docker & Kubernetes"))
                        .level("Intermediate")
                        .message("Hi Alice! I have experience with Docker containers and Python scripting. Would love to contribute to the AI code analyzer.")
                        .status("pending")
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build();
                joinRequestRepository.save(req);

                JoinRequest req2 = JoinRequest.builder()
                        .project(p3)
                        .applicant(alice)
                        .skills(List.of("AWS Cloud", "Linux & Bash"))
                        .level("Intermediate")
                        .message("Hi Bob! I have AWS experience and solid Bash scripting skills. This project looks great!")
                        .status("pending")
                        .createdAt(LocalDateTime.now().minusHours(6))
                        .build();
                joinRequestRepository.save(req2);
            }
        }

        log.info("DataInitializer successfully completed seeding all real data ({} careers, {} courses, {} discovery questions, {} assessment questions)",
                careerRepository.count(), courseRepository.count(),
                discoveryQuestionRepository.count(), assessmentQuestionRepository.count());
    }

    /**
     * Merges a skill that was seeded under an older name (in a previous version of
     * this file) into the skill's current name, repointing all references so no
     * data is silently lost or left orphaned. Safe to call on every startup: once
     * the old-named skill no longer exists, this is a no-op.
     *
     * For each referencing table, if the target row's (foreign key, newId) pair
     * already exists, the old row is simply dropped (the current row wins);
     * otherwise the old row is repointed to the new skill id so the data is kept.
     */
    private void mergeDuplicateSkill(String oldSkillName, String newSkillName) {
        try {
            Long oldId = findSkillIdByName(oldSkillName);
            Long newId = findSkillIdByName(newSkillName);
            if (oldId == null || newId == null || oldId.equals(newId)) {
                return;
            }

            jdbcTemplate.update(
                    "UPDATE career_skills SET skill_id = ? WHERE skill_id = ? " +
                            "AND NOT EXISTS (SELECT 1 FROM career_skills cs2 WHERE cs2.career_id = career_skills.career_id AND cs2.skill_id = ?)",
                    newId, oldId, newId);
            jdbcTemplate.update("DELETE FROM career_skills WHERE skill_id = ?", oldId);

            jdbcTemplate.update(
                    "UPDATE course_skills SET skill_id = ? WHERE skill_id = ? " +
                            "AND NOT EXISTS (SELECT 1 FROM course_skills cs2 WHERE cs2.course_id = course_skills.course_id AND cs2.skill_id = ?)",
                    newId, oldId, newId);
            jdbcTemplate.update("DELETE FROM course_skills WHERE skill_id = ?", oldId);

            jdbcTemplate.update(
                    "UPDATE user_skills SET skill_id = ? WHERE skill_id = ? " +
                            "AND NOT EXISTS (SELECT 1 FROM user_skills us2 WHERE us2.user_id = user_skills.user_id AND us2.skill_id = ?)",
                    newId, oldId, newId);
            jdbcTemplate.update("DELETE FROM user_skills WHERE skill_id = ?", oldId);

            // Assessment questions have no per-skill uniqueness constraint, so they can
            // simply be repointed to the current skill without any conflict risk.
            jdbcTemplate.update("UPDATE assessment_questions SET skill_id = ? WHERE skill_id = ?", newId, oldId);

            jdbcTemplate.update("DELETE FROM skills WHERE id = ?", oldId);

            log.info("Merged duplicate skill '{}' (id={}) into '{}' (id={})", oldSkillName, oldId, newSkillName, newId);
        } catch (Exception e) {
            log.warn("Could not merge duplicate skill '{}' into '{}': {}", oldSkillName, newSkillName, e.getMessage());
        }
    }

    private Long findSkillIdByName(String name) {
        List<Long> ids = jdbcTemplate.queryForList("SELECT id FROM skills WHERE LOWER(name) = LOWER(?)", Long.class, name);
        return ids.isEmpty() ? null : ids.get(0);
    }

    private User seedUser(String email, String name, Role role, String bio) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode("password123"))
                    .name(name)
                    .provider(AuthProvider.LOCAL)
                    .emailVerified(true)
                    .role(role)
                    .build();
            return userRepository.save(u);
        });
    }

    private Skill seedSkill(String name, String category, String description) {
        return skillRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Skill s = Skill.builder().name(name).category(category).description(description).build();
            return skillRepository.save(s);
        });
    }

    private Career seedCareer(String name, String category, String icon, String description, String responsibilities) {
        return careerRepository.findByNameContainingIgnoreCase(name).stream().findFirst().orElseGet(() -> {
            Career c = Career.builder()
                    .name(name).category(category).icon(icon)
                    .description(description).responsibilities(responsibilities)
                    .active(true)
                    .build();
            return careerRepository.save(c);
        });
    }

    /**
     * Upserts a career's required level/importance for a skill. Unlike a plain
     * insert-if-missing helper, this also corrects the level/importance on an
     * already-existing row so that edits made to this file (e.g. rebalancing how
     * important a skill is for a career) actually take effect on databases that
     * were seeded before the edit, instead of silently keeping stale values
     * forever and corrupting skill-gap/roadmap calculations.
     */
    private void seedCareerSkill(Career career, Skill skill, int requiredLevel, double importance) {
        CareerSkill existing = careerSkillRepository.findByCareerId(career.getId()).stream()
                .filter(cs -> cs.getSkill().getId().equals(skill.getId()))
                .findFirst()
                .orElse(null);
        if (existing == null) {
            careerSkillRepository.save(CareerSkill.builder()
                    .career(career).skill(skill)
                    .requiredLevel(requiredLevel).importance(importance)
                    .build());
        } else if (!existing.getRequiredLevel().equals(requiredLevel) || Math.abs(existing.getImportance() - importance) > 0.0001) {
            existing.setRequiredLevel(requiredLevel);
            existing.setImportance(importance);
            careerSkillRepository.save(existing);
        }
    }

    private void seedDiscoveryQuestion(String question, int orderIndex, String optionsJson) {
        discoveryQuestionRepository.save(CareerDiscoveryQuestion.builder()
                .question(question).orderIndex(orderIndex).optionsJson(optionsJson)
                .build());
    }

    /**
     * Idempotent variant that only inserts the question if no existing question
     * with the same text is present. Used to backfill new discovery questions
     * onto databases that already ran the initial (count == 0 gated) seeding.
     */
    private void seedDiscoveryQuestionIfMissing(String question, int orderIndex, String optionsJson) {
        boolean exists = discoveryQuestionRepository.findAllByOrderByOrderIndexAsc().stream()
                .anyMatch(q -> q.getQuestion().equalsIgnoreCase(question));
        if (!exists) {
            seedDiscoveryQuestion(question, orderIndex, optionsJson);
        }
    }

    private void seedAssessmentQuestion(Skill skill, String question, String type, String optionsJson,
                                         String correctAnswer, Integer difficulty, Integer orderIndex) {
        assessmentQuestionRepository.save(AssessmentQuestion.builder()
                .skill(skill).question(question).type(type).optionsJson(optionsJson)
                .correctAnswer(correctAnswer).difficulty(difficulty).orderIndex(orderIndex)
                .build());
    }

    /**
     * Idempotent variant that only inserts the question if no existing question
     * for the same skill and text is present. Used to backfill assessment
     * coverage for skills (e.g. Git, Redis, Terraform, Kafka, CSS, Linux) added
     * after the initial (count == 0 gated) seeding already ran.
     */
    private void seedAssessmentQuestionIfMissing(Skill skill, String question, String type, String optionsJson,
                                                   String correctAnswer, Integer difficulty, Integer orderIndex) {
        boolean exists = assessmentQuestionRepository.findBySkillId(skill.getId()).stream()
                .anyMatch(q -> q.getQuestion().equalsIgnoreCase(question));
        if (!exists) {
            seedAssessmentQuestion(skill, question, type, optionsJson, correctAnswer, difficulty, orderIndex);
        }
    }

    private Course seedCourse(String title, String category, String description, String difficulty,
                               int durationHours, double rating, int enrollmentCount) {
        return courseRepository.findAll().stream()
                .filter(c -> c.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .orElseGet(() -> courseRepository.save(Course.builder()
                        .title(title).category(category).description(description)
                        .difficulty(difficulty).durationHours(durationHours)
                        .rating(rating).enrollmentCount(enrollmentCount)
                        .published(true)
                        .build()));
    }

    private void seedLesson(Course course, String title, int order, String content, int durationMinutes) {
        boolean exists = lessonRepository.findByCourseIdOrderByLessonOrder(course.getId()).stream()
                .anyMatch(l -> l.getTitle().equalsIgnoreCase(title));
        if (!exists) {
            lessonRepository.save(Lesson.builder()
                    .course(course).title(title).lessonOrder(order)
                    .content(content).estimatedMinutes(durationMinutes)
                    .build());
        }
    }

    private void seedCourseSkill(Course course, Skill skill, int targetLevel) {
        boolean exists = courseSkillRepository.findByCourseId(course.getId()).stream()
                .anyMatch(cs -> cs.getSkill().getId().equals(skill.getId()));
        if (!exists) {
            courseSkillRepository.save(CourseSkill.builder()
                    .course(course).skill(skill)
                    .targetLevel(targetLevel).importance(1.0)
                    .build());
        }
    }

    private void seedCoursePrerequisite(Course course, Course requiredCourse) {
        boolean exists = coursePrerequisiteRepository.findByCourseId(course.getId()).stream()
                .anyMatch(cp -> cp.getRequiredCourse().getId().equals(requiredCourse.getId()));
        if (!exists) {
            coursePrerequisiteRepository.save(CoursePrerequisite.builder()
                    .course(course).requiredCourse(requiredCourse)
                    .build());
        }
    }

    private Project seedProject(User owner, String title, String description, String category,
                                  String level, String duration, String commitment,
                                  int maxMembers, String status, List<String> skills) {
        return projectRepository.save(Project.builder()
                .owner(owner).title(title).description(description)
                .category(category).level(level).duration(duration)
                .commitment(commitment).deadline(LocalDate.now().plusMonths(1))
                .maxMembers(maxMembers).status(status).skills(skills)
                .build());
    }
}
