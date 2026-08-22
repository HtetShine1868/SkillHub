-- Seed Skills
INSERT INTO skills (id, name, category, description) VALUES
(1, 'Java', 'Programming', 'Core programming in Java including syntax, APIs, collections, and streams.') ON CONFLICT (name) DO NOTHING;
INSERT INTO skills (id, name, category, description) VALUES
(2, 'OOP', 'Software Engineering', 'Object-Oriented Programming principles: Encapsulation, Inheritance, Polymorphism, Abstraction.') ON CONFLICT (name) DO NOTHING;
INSERT INTO skills (id, name, category, description) VALUES
(3, 'SQL', 'Databases', 'Relational database query language: Selects, joins, aggregates, indexing.') ON CONFLICT (name) DO NOTHING;
INSERT INTO skills (id, name, category, description) VALUES
(4, 'Spring Boot', 'Backend Frameworks', 'Spring core concepts, dependency injection, auto-configuration, REST services.') ON CONFLICT (name) DO NOTHING;
INSERT INTO skills (id, name, category, description) VALUES
(5, 'REST API', 'Web Services', 'REST architecture principles, request/response models, HTTP verbs, status codes.') ON CONFLICT (name) DO NOTHING;
INSERT INTO skills (id, name, category, description) VALUES
(6, 'JPA / Hibernate', 'Databases', 'Java Persistence API, Hibernate ORM mapping, entity relationships, query methods.') ON CONFLICT (name) DO NOTHING;
INSERT INTO skills (id, name, category, description) VALUES
(7, 'Docker', 'DevOps', 'Containerization fundamentals, Dockerfiles, images, containers, networks, volumes.') ON CONFLICT (name) DO NOTHING;

-- Seed Careers
INSERT INTO careers (id, name, description, category, icon, responsibilities) VALUES
(1, 'Java Developer', 'Build powerful backend applications, scalable microservices, and databases using Java and Spring Boot.', 'Backend Development', '☕', 'Write clean and efficient Java code;Design database schemas and optimize SQL queries;Implement secure and reliable REST APIs;Build and deploy containers using Docker') ON CONFLICT (name) DO NOTHING;
INSERT INTO careers (id, name, description, category, icon, responsibilities) VALUES
(2, 'Frontend Developer', 'Design and implement immersive, beautiful, and responsive web user interfaces using modern React frameworks.', 'Frontend Development', '🎨', 'Develop responsive React web layouts;Optimize UI components for performance;Integrate frontend routes with REST APIs;Collaborate on designer mockups') ON CONFLICT (name) DO NOTHING;

-- Seed Career Skills
INSERT INTO career_skills (id, career_id, skill_id, required_level, importance) VALUES
(1, 1, 1, 4, 0.90) ON CONFLICT (career_id, skill_id) DO NOTHING;
INSERT INTO career_skills (id, career_id, skill_id, required_level, importance) VALUES
(2, 1, 2, 4, 0.85) ON CONFLICT (career_id, skill_id) DO NOTHING;
INSERT INTO career_skills (id, career_id, skill_id, required_level, importance) VALUES
(3, 1, 3, 3, 0.80) ON CONFLICT (career_id, skill_id) DO NOTHING;
INSERT INTO career_skills (id, career_id, skill_id, required_level, importance) VALUES
(4, 1, 4, 4, 1.00) ON CONFLICT (career_id, skill_id) DO NOTHING;
INSERT INTO career_skills (id, career_id, skill_id, required_level, importance) VALUES
(5, 1, 5, 4, 0.95) ON CONFLICT (career_id, skill_id) DO NOTHING;
INSERT INTO career_skills (id, career_id, skill_id, required_level, importance) VALUES
(6, 1, 6, 3, 0.75) ON CONFLICT (career_id, skill_id) DO NOTHING;
INSERT INTO career_skills (id, career_id, skill_id, required_level, importance) VALUES
(7, 1, 7, 2, 0.50) ON CONFLICT (career_id, skill_id) DO NOTHING;

-- Seed Career Discovery Questions
INSERT INTO career_discovery_questions (id, question, options_json, order_index) VALUES
(1, 'Which type of task sounds more exciting to you?', '[{"index":0,"label":"Building the core logic and systems of an application","description":"Working with databases, APIs, and business systems.","weights":{"1":5,"2":1}},{"index":1,"label":"Designing user experiences and animations","description":"Working with layouts, CSS, React components, and responsive views.","weights":{"1":1,"2":5}}]', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO career_discovery_questions (id, question, options_json, order_index) VALUES
(2, 'How do you feel about working with visual designs and mockups?', '[{"index":0,"label":"I prefer logical architecture over visuals","description":"I would rather optimize search algorithms or query times.","weights":{"1":5,"2":1}},{"index":1,"label":"I love bringing visual interfaces to life","description":"Translating design files into perfect functional web pages.","weights":{"1":1,"2":5}}]', 2) ON CONFLICT (id) DO NOTHING;

-- Seed Skill Assessment Questions (Self-reported & Knowledge questions)
INSERT INTO assessment_questions (id, skill_id, question, type, options_json, correct_answer, difficulty, order_index) VALUES
(1, 1, 'How comfortable are you with Java?', 'SELF_REPORTED', '[{"label":"Beginner","description":"I have little or no experience with Java.","value":1},{"label":"Basic","description":"I understand basic Java syntax and loops.","value":2},{"label":"Intermediate","description":"I can build applications and use Collections/Streams.","value":3},{"label":"Advanced","description":"I can confidently build complex enterprise Java apps.","value":4}]', null, 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO assessment_questions (id, skill_id, question, type, options_json, correct_answer, difficulty, order_index) VALUES
(2, 2, 'How comfortable are you with Object-Oriented Programming?', 'SELF_REPORTED', '[{"label":"Beginner","description":"I am unfamiliar with OOP.","value":1},{"label":"Basic","description":"I understand classes and object instances.","value":2},{"label":"Intermediate","description":"I apply encapsulation, inheritance, and interface patterns.","value":3},{"label":"Advanced","description":"I design complex polymorphic systems.","value":4}]', null, 0, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO assessment_questions (id, skill_id, question, type, options_json, correct_answer, difficulty, order_index) VALUES
(3, 3, 'How comfortable are you with SQL databases?', 'SELF_REPORTED', '[{"label":"Beginner","description":"I have never used SQL.","value":1},{"label":"Basic","description":"I can write simple SELECT queries.","value":2},{"label":"Intermediate","description":"I can work with JOINS, indexes, and constraints.","value":3},{"label":"Advanced","description":"I optimize queries and design schemas.","value":4}]', null, 0, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO assessment_questions (id, skill_id, question, type, options_json, correct_answer, difficulty, order_index) VALUES
(4, 4, 'How comfortable are you with Spring Boot?', 'SELF_REPORTED', '[{"label":"Beginner","description":"I have never used Spring Boot.","value":1},{"label":"Basic","description":"I understand basic routing and Controllers.","value":2},{"label":"Intermediate","description":"I build MVC or REST microservices with JPA.","value":3},{"label":"Advanced","description":"I configure security, filters, and caching.","value":4}]', null, 0, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO assessment_questions (id, skill_id, question, type, options_json, correct_answer, difficulty, order_index) VALUES
(5, 5, 'Have you built a REST API before?', 'SELF_REPORTED', '[{"label":"Never","description":"I have never built a REST API.","value":1},{"label":"Learned the concept","description":"I understand HTTP verbs and RESTful concepts.","value":2},{"label":"Built a simple API","description":"I have built a basic CRUD endpoint.","value":3},{"label":"Built APIs in production","description":"I design REST interfaces using best practices.","value":4}]', null, 0, 5) ON CONFLICT (id) DO NOTHING;

-- Knowledge questions for Java
INSERT INTO assessment_questions (id, skill_id, question, type, options_json, correct_answer, difficulty, order_index) VALUES
(6, 1, 'Which Java collection class allows null elements but does not guarantee iteration order?', 'KNOWLEDGE', '[{"optionKey":"A","text":"TreeSet"},{"optionKey":"B","text":"HashSet"},{"optionKey":"C","text":"LinkedHashSet"},{"optionKey":"D","text":"ArrayDeque"}]', 'B', 2, 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO assessment_questions (id, skill_id, question, type, options_json, correct_answer, difficulty, order_index) VALUES
(7, 1, 'In Java, what is the default capacity of an ArrayList if not specified?', 'KNOWLEDGE', '[{"optionKey":"A","text":"0"},{"optionKey":"B","text":"10"},{"optionKey":"C","text":"16"},{"optionKey":"D","text":"20"}]', 'B', 1, 7) ON CONFLICT (id) DO NOTHING;

-- Knowledge questions for OOP
INSERT INTO assessment_questions (id, skill_id, question, type, options_json, correct_answer, difficulty, order_index) VALUES
(8, 2, 'Which OOP principle is best represented by hiding internal details and showing only essentials?', 'KNOWLEDGE', '[{"optionKey":"A","text":"Inheritance"},{"optionKey":"B","text":"Polymorphism"},{"optionKey":"C","text":"Encapsulation"},{"optionKey":"D","text":"Abstraction"}]', 'C', 1, 8) ON CONFLICT (id) DO NOTHING;

-- Knowledge questions for Spring Boot
INSERT INTO assessment_questions (id, skill_id, question, type, options_json, correct_answer, difficulty, order_index) VALUES
(9, 4, 'What is the purpose of @RestController annotation in Spring Boot?', 'KNOWLEDGE', '[{"optionKey":"A","text":"To render HTML templates"},{"optionKey":"B","text":"To combine @Controller and @ResponseBody annotations"},{"optionKey":"C","text":"To register database repositories"},{"optionKey":"D","text":"To implement security filters"}]', 'B', 2, 9) ON CONFLICT (id) DO NOTHING;

-- Seed Courses
INSERT INTO courses (id, title, description, category, difficulty, duration_hours, thumbnail_url, rating, enrollment_count, published, created_at) VALUES
(1, 'Spring Boot Fundamentals', 'Learn the core concepts of Spring Boot, dependency injection, and project structuring.', 'Backend Development', 'Beginner', 12, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', 4.8, 120, true, NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO courses (id, title, description, category, difficulty, duration_hours, thumbnail_url, rating, enrollment_count, published, created_at) VALUES
(2, 'Building REST APIs with Spring Boot', 'Design, build, and document professional-grade REST web services.', 'Backend Development', 'Intermediate', 8, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97', 4.7, 95, true, NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO courses (id, title, description, category, difficulty, duration_hours, thumbnail_url, rating, enrollment_count, published, created_at) VALUES
(3, 'Spring Data JPA & Hibernate', 'Understand entity mapping, table relationships, transactions, and performance optimizations.', 'Backend Development', 'Intermediate', 10, 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d', 4.9, 80, true, NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO courses (id, title, description, category, difficulty, duration_hours, thumbnail_url, rating, enrollment_count, published, created_at) VALUES
(4, 'Docker for Java Developers', 'Containerize, network, and orchestrate Java applications using Docker Compose.', 'DevOps', 'Intermediate', 6, 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3', 4.6, 60, true, NOW()) ON CONFLICT (id) DO NOTHING;

-- Seed Course Skills (prerequisites and targets)
INSERT INTO course_skills (id, course_id, skill_id, target_level, importance) VALUES
(1, 1, 4, 2, 1.0) ON CONFLICT (course_id, skill_id) DO NOTHING; -- teaches Spring Boot up to Basic
INSERT INTO course_skills (id, course_id, skill_id, target_level, importance) VALUES
(2, 2, 4, 3, 0.8) ON CONFLICT (course_id, skill_id) DO NOTHING; -- teaches Spring Boot up to Intermediate
INSERT INTO course_skills (id, course_id, skill_id, target_level, importance) VALUES
(3, 2, 5, 3, 1.0) ON CONFLICT (course_id, skill_id) DO NOTHING; -- teaches REST API up to Intermediate
INSERT INTO course_skills (id, course_id, skill_id, target_level, importance) VALUES
(4, 3, 6, 3, 1.0) ON CONFLICT (course_id, skill_id) DO NOTHING; -- teaches JPA up to Intermediate
INSERT INTO course_skills (id, course_id, skill_id, target_level, importance) VALUES
(5, 4, 7, 2, 1.0) ON CONFLICT (course_id, skill_id) DO NOTHING; -- teaches Docker up to Basic

-- Seed Course Prerequisites
INSERT INTO course_prerequisites (id, course_id, required_course_id) VALUES
(1, 2, 1) ON CONFLICT (course_id, required_course_id) DO NOTHING; -- REST API requires Spring Boot Fundamentals
INSERT INTO course_prerequisites (id, course_id, required_course_id) VALUES
(2, 3, 1) ON CONFLICT (course_id, required_course_id) DO NOTHING; -- JPA requires Spring Boot Fundamentals
INSERT INTO course_prerequisites (id, course_id, required_course_id) VALUES
(3, 4, 2) ON CONFLICT (course_id, required_course_id) DO NOTHING; -- Docker requires REST API

-- Seed Lessons
INSERT INTO lessons (id, course_id, title, lesson_order, estimated_minutes, content) VALUES
(1, 1, 'Introduction to Spring Boot', 1, 15, '# Introduction to Spring Boot\n\nSpring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can "just run".\n\nWe take an opinionated view of the Spring platform and third-party libraries so you can get started with minimum fuss. Most Spring Boot applications need minimal Spring configuration.') ON CONFLICT (id) DO NOTHING;
INSERT INTO lessons (id, course_id, title, lesson_order, estimated_minutes, content) VALUES
(2, 1, 'Dependency Injection & IOC', 2, 20, '# Dependency Injection & Inversion of Control\n\nDependency Injection (DI) is a design pattern that removes the dependency from the programming code so that it can be easy to manage and test application.\n\nIn Spring framework, the IoC Container is responsible for instantiating, configuring and assembling the objects.') ON CONFLICT (id) DO NOTHING;
INSERT INTO lessons (id, course_id, title, lesson_order, estimated_minutes, content) VALUES
(3, 2, 'REST Fundamentals & HTTP', 1, 15, '# REST API Fundamentals\n\nRepresentational State Transfer (REST) is an architectural style for providing standards between computer systems on the web, making it easier for systems to communicate with each other.') ON CONFLICT (id) DO NOTHING;
INSERT INTO lessons (id, course_id, title, lesson_order, estimated_minutes, content) VALUES
(4, 2, 'Creating REST Controllers', 2, 25, '# Creating REST Controllers\n\nLearn to build REST endpoints using `@RestController` and routing mappings like `@GetMapping` and `@PostMapping`.') ON CONFLICT (id) DO NOTHING;
