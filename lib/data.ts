import { Database, Brain, BarChart3, Sailboat, Bot } from "lucide-react"

export const projects = [
  {
    title: "TUNE - AI Fine-Tuning Platform",
    description: "A Notion-meets-W&B for SMEs to fine-tune and deploy LLMs easily. Simplifying complex AI workflows.",
    tech: ["Next.js", "Python", "Docker", "OpenAI API", "Vector DB"],
    liveDemo: "/projects/tune", // Example: link to a page or section
    codeLink: "https://github.com/sakthiish12/tune", // Updated with correct GitHub username
    caseStudy: "/case-studies/tune", // Example
    icon: Brain, // Use as <Icon ... /> in consuming code
  },
  {
    title: "Calorie Tracker AI App",
    description:
      "AI-powered calorie tracking with intuitive UI. Mock data used for frontend demo, showcasing features and flow.",
    tech: ["Flutter", "Firebase", "AI (NLP)", "Dart"],
    liveDemo: "#",
    codeLink: "#",
    caseStudy: null,
    icon: BarChart3, // Use as <Icon ... /> in consuming code
  },
  {
    title: "Debt Repayment App",
    description:
      "MVP for debt management with calculator, charts, and API integration mockup. Helps users strategize repayments.",
    tech: ["React", "Node.js", "Chart.js", "API Mockup"],
    liveDemo: "#",
    codeLink: "#",
    caseStudy: "#",
    icon: Database, // Use as <Icon ... /> in consuming code
  },
  {
    title: "SailPoint Automation Rule Generator",
    description:
      "Internal tool that significantly cut down debugging time for SailPoint IIQ rules by automating generation and validation.",
    tech: ["Java", "XML", "SailPoint IIQ", "Groovy"],
    liveDemo: null, // Internal tool
    codeLink: "#", // If shareable
    caseStudy: "#",
    icon: Sailboat, // Use as <Icon ... /> in consuming code
  },
]

export const resumeItems = [
  {
    logoUrl: "/placeholder.svg?width=50&height=50", // Replace with actual logo e.g., /logos/deloitte.png
    company: "Deloitte",
    role: "Risk Advisory Consultant",
    duration: "2022 - Present",
    description:
      "Working on enterprise IAM systems, cybersecurity strategies, and digital transformation projects for Fortune 500 clients.",
    tags: ["IAM", "Cybersecurity", "Consulting", "Enterprise"],
  },
  {
    logoUrl: "/placeholder.svg?width=50&height=50", // Replace with actual logo
    company: "TUNE (Side Hustle)",
    role: "Founder & Lead Developer",
    duration: "2023 - Present",
    description:
      "Building an AI fine-tuning and deployment platform for SMEs. Overseeing product development, tech architecture, and strategy.",
    tags: ["AI", "SaaS", "Founder", "LLMOps"],
  },
  {
    logoUrl: "/placeholder.svg?width=50&height=50", // Replace with actual logo
    company: "Doerscircle (Startup)",
    role: "Full-Stack Developer",
    duration: "2020 - 2022",
    description:
      "Developed key features for a B2B platform, contributing to product growth and user engagement in a fast-paced startup environment.",
    tags: ["Full-Stack", "Startup", "Agile", "Product Dev"],
  },
]

export const certifications = [
  { name: "Professional Scrum Master™ I (PSM I)", issuer: "Scrum.org" },
  { name: "Microsoft Certified: Identity and Access Administrator Associate", issuer: "Microsoft" },
  { name: "Neo4j Certified Professional", issuer: "Neo4j" },
]

export const skills = {
  languages: ["Python", "Java", "JavaScript/TypeScript", "XML", "SQL", "Groovy", "Dart"],
  frameworksPlatforms: ["SailPoint IIQ", "Next.js", "Node.js", "React", "Flutter", "Neo4j", "Firebase", "Spring Boot"],
  aiMl: ["Fine-tuning LLMs", "RAG Systems", "LLM Ops", "Prompt Engineering", "LangChain", "Vector Databases"],
  tools: ["Postman", "GitHub/GitLab", "MongoDB", "Docker", "Kubernetes", "Jenkins", "OpenAI API", "JIRA"],
  currentlyLearning: ["Advanced LangChain", "AWS Certified Solutions Architect", "Cybersecurity Red Teaming"],
}

export const articles = [
  {
    title: "Why SMEs Can’t Afford to Ignore AI Fine-Tuning",
    link: "#", // Replace with actual link
    icon: Brain, // Use as <Icon ... /> in consuming code
    description: "Exploring the competitive edge AI fine-tuning offers to small and medium enterprises.",
  },
  {
    title: "Lessons from Debugging SailPoint in Production",
    link: "#",
    icon: Sailboat, // Use as <Icon ... /> in consuming code
    description: "Practical insights and strategies for troubleshooting complex IAM systems under pressure.",
  },
  {
    title: "Building an AI Assistant for My Renovation — A Real-World LLM Story",
    link: "#",
    icon: Bot, // Use as <Icon ... /> in consuming code
    description: "A personal journey of applying LLM technology to solve everyday problems.",
  },
]
