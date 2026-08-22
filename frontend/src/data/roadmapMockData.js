export const selectedCareer = {
  title: 'Java Developer',
  category: 'Backend Development',
  icon: '☕',
  description:
    'Build powerful backend applications and become a job-ready Java Developer based on your current skills.',

  requiredSkills: [
    'Java',
    'OOP',
    'SQL',
    'Spring Boot',
    'REST API',
    'JPA',
    'Spring Security',
    'Docker',
  ],
}

export const assessmentQuestions = [
  {
    id: 1,
    skill: 'Java',
    question: 'How comfortable are you with Java?',
    type: 'skill-level',
    options: [
      {
        label: 'Beginner',
        description: 'I have little or no experience with Java.',
        value: 1,
      },
      {
        label: 'Basic',
        description: 'I understand basic Java syntax and concepts.',
        value: 2,
      },
      {
        label: 'Intermediate',
        description: 'I can build applications using Java.',
        value: 3,
      },
      {
        label: 'Advanced',
        description: 'I can confidently build complex Java applications.',
        value: 4,
      },
    ],
  },

  {
    id: 2,
    skill: 'OOP',
    question: 'How comfortable are you with Object-Oriented Programming?',
    type: 'skill-level',
    options: [
      {
        label: 'Beginner',
        description: 'I am unfamiliar with OOP.',
        value: 1,
      },
      {
        label: 'Basic',
        description: 'I understand classes and objects.',
        value: 2,
      },
      {
        label: 'Intermediate',
        description: 'I can apply OOP principles in projects.',
        value: 3,
      },
      {
        label: 'Advanced',
        description: 'I can design complex systems using OOP.',
        value: 4,
      },
    ],
  },

  {
    id: 3,
    skill: 'SQL',
    question: 'How comfortable are you with SQL?',
    type: 'skill-level',
    options: [
      {
        label: 'Beginner',
        description: 'I have never used SQL.',
        value: 1,
      },
      {
        label: 'Basic',
        description: 'I can write simple SQL queries.',
        value: 2,
      },
      {
        label: 'Intermediate',
        description: 'I can work with joins and complex queries.',
        value: 3,
      },
      {
        label: 'Advanced',
        description: 'I can design and optimize databases.',
        value: 4,
      },
    ],
  },

  {
    id: 4,
    skill: 'Spring Boot',
    question: 'How comfortable are you with Spring Boot?',
    type: 'skill-level',
    options: [
      {
        label: 'Beginner',
        description: 'I have never used Spring Boot.',
        value: 1,
      },
      {
        label: 'Basic',
        description: 'I understand the basic concepts.',
        value: 2,
      },
      {
        label: 'Intermediate',
        description: 'I can build simple Spring Boot applications.',
        value: 3,
      },
      {
        label: 'Advanced',
        description: 'I have built multiple Spring Boot projects.',
        value: 4,
      },
    ],
  },

  {
    id: 5,
    skill: 'REST API',
    question: 'Have you built a REST API before?',
    type: 'experience',
    options: [
      {
        label: 'Never',
        description: 'I have never built a REST API.',
        value: 1,
      },
      {
        label: 'Learned the concept',
        description: 'I understand what a REST API is.',
        value: 2,
      },
      {
        label: 'Built a simple API',
        description: 'I have built a basic REST API.',
        value: 3,
      },
      {
        label: 'Built APIs in projects',
        description: 'I have used REST APIs in real projects.',
        value: 4,
      },
    ],
  },
]
export const skillGapData = [
  {
    id: 'java',
    skill: 'Java',
    currentLevel: 'Advanced',
    currentScore: 90,
    requiredLevel: 'Advanced',
    requiredScore: 90,
    status: 'complete',
    message: 'You already meet the required level.',
  },

  {
    id: 'oop',
    skill: 'Object-Oriented Programming',
    currentLevel: 'Intermediate',
    currentScore: 65,
    requiredLevel: 'Advanced',
    requiredScore: 90,
    status: 'improve',
    message: 'Strengthen your OOP concepts before moving forward.',
  },

  {
    id: 'sql',
    skill: 'SQL',
    currentLevel: 'Basic',
    currentScore: 45,
    requiredLevel: 'Intermediate',
    requiredScore: 70,
    status: 'improve',
    message: 'You need more practice with relational databases.',
  },

  {
    id: 'spring',
    skill: 'Spring Boot',
    currentLevel: 'Beginner',
    currentScore: 25,
    requiredLevel: 'Intermediate',
    requiredScore: 70,
    status: 'improve',
    message: 'Spring Boot is one of your biggest current skill gaps.',
  },

  {
    id: 'rest',
    skill: 'REST API',
    currentLevel: 'Beginner',
    currentScore: 20,
    requiredLevel: 'Intermediate',
    requiredScore: 70,
    status: 'improve',
    message: 'Learn how to design and build RESTful APIs.',
  },

  {
    id: 'jpa',
    skill: 'JPA / Hibernate',
    currentLevel: 'None',
    currentScore: 0,
    requiredLevel: 'Intermediate',
    requiredScore: 70,
    status: 'missing',
    message: 'This is a new skill you need to learn.',
  },

  {
    id: 'docker',
    skill: 'Docker',
    currentLevel: 'None',
    currentScore: 0,
    requiredLevel: 'Basic',
    requiredScore: 50,
    status: 'missing',
    message: 'Docker will help you deploy your applications.',
  },
]


export const roadmapStages = [
  {
    id: 'java',
    title: 'Java Fundamentals',
    shortTitle: 'Java',
    status: 'completed',
    description: 'Build a strong foundation in modern Java.',
    courses: [],
  },

  {
    id: 'oop',
    title: 'Object-Oriented Programming',
    shortTitle: 'OOP',
    status: 'completed',
    description: 'Master classes, inheritance, abstraction and polymorphism.',
    courses: [],
  },

  {
    id: 'sql',
    title: 'SQL & Databases',
    shortTitle: 'SQL',
    status: 'completed',
    description: 'Learn how applications work with relational databases.',
    courses: [],
  },

  {
    id: 'spring',
    title: 'Spring Boot',
    shortTitle: 'Spring Boot',
    status: 'current',
    description: 'Build production-ready backend applications with Spring Boot.',
    courses: [
      'spring-fundamentals',
      'spring-rest',
    ],
  },

  {
    id: 'rest',
    title: 'REST API Development',
    shortTitle: 'REST API',
    status: 'available',
    description: 'Design and build clean REST APIs.',
    courses: [
      'spring-rest',
    ],
  },

  {
    id: 'jpa',
    title: 'JPA & Hibernate',
    shortTitle: 'JPA',
    status: 'locked',
    description: 'Connect Java applications with relational databases.',
    lockedReason: 'Complete REST API Development first.',
    courses: [
      'spring-jpa',
    ],
  },

  {
    id: 'docker',
    title: 'Docker for Developers',
    shortTitle: 'Docker',
    status: 'locked',
    description: 'Containerize and deploy your Java applications.',
    lockedReason: 'Complete JPA & Hibernate first.',
    courses: [
      'docker-java',
    ],
  },
]


export const roadmapCourses = [
  {
    id: 'spring-fundamentals',
    title: 'Spring Boot Fundamentals',
    description:
      'Learn the fundamentals of Spring Boot and start building backend applications.',
    rating: 4.8,
    difficulty: 'Beginner',
    duration: '12 hours',
    lessons: 42,
    skills: ['Spring Boot', 'Dependency Injection', 'Configuration'],
    prerequisites: ['Java', 'OOP'],
    roadmapSkill: 'Spring Boot',
    status: 'recommended',
    reason:
      'Spring Boot is one of your biggest current skill gaps.',
  },

  {
    id: 'spring-rest',
    title: 'Building REST APIs with Spring Boot',
    description:
      'Learn how to create clean, scalable REST APIs using Spring Boot.',
    rating: 4.7,
    difficulty: 'Intermediate',
    duration: '8 hours',
    lessons: 28,
    skills: ['REST API', 'Spring Boot', 'HTTP'],
    prerequisites: ['Java', 'OOP', 'Spring Boot'],
    roadmapSkill: 'REST API',
    status: 'locked',
    reason:
      'This course prepares you for professional API development.',
  },

  {
    id: 'spring-jpa',
    title: 'Spring Data JPA & Hibernate',
    description:
      'Understand persistence, entities, relationships and database access.',
    rating: 4.9,
    difficulty: 'Intermediate',
    duration: '10 hours',
    lessons: 35,
    skills: ['JPA', 'Hibernate', 'SQL'],
    prerequisites: ['Java', 'SQL', 'Spring Boot'],
    roadmapSkill: 'JPA / Hibernate',
    status: 'locked',
    reason:
      'JPA is required to build database-driven Spring applications.',
  },

  {
    id: 'docker-java',
    title: 'Docker for Java Developers',
    description:
      'Learn how to containerize and deploy Java backend applications.',
    rating: 4.6,
    difficulty: 'Intermediate',
    duration: '6 hours',
    lessons: 22,
    skills: ['Docker', 'Containers', 'Deployment'],
    prerequisites: ['Java', 'Spring Boot'],
    roadmapSkill: 'Docker',
    status: 'locked',
    reason:
      'Docker is the final deployment skill in your roadmap.',
  },
]