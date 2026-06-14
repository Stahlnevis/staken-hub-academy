import {
  Shield, Code2, Cpu, Brain, BarChart3, Globe2, Smartphone, Palette, Bot, GraduationCap,
} from "lucide-react";

export type Programme = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  icon: typeof Shield;
};

export const PROGRAMMES: Programme[] = [
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    description: "Master ethical hacking, network defense, and threat intelligence to protect modern digital infrastructure.",
    duration: "16 Weeks",
    level: "Intermediate",
    icon: Shield,
  },
  {
    slug: "software-development",
    title: "Software Development",
    description: "Build scalable, maintainable applications using modern engineering practices and team workflows.",
    duration: "24 Weeks",
    level: "Beginner",
    icon: Code2,
  },
  {
    slug: "programming-languages",
    title: "Programming Languages",
    description: "Get hands-on with Python, C++, and JavaScript through project-based, mentor-led tracks.",
    duration: "12 Weeks",
    level: "Beginner",
    icon: Cpu,
  },
  {
    slug: "ai-awareness",
    title: "Artificial Intelligence Awareness",
    description: "Understand LLMs, prompt engineering, and responsible AI use across business and society.",
    duration: "6 Weeks",
    level: "All Levels",
    icon: Brain,
  },
  {
    slug: "data-science",
    title: "Data Science",
    description: "Turn data into insight with statistics, Python, machine learning, and visualization.",
    duration: "20 Weeks",
    level: "Intermediate",
    icon: BarChart3,
  },
  {
    slug: "web-development",
    title: "Web Development",
    description: "Design and ship responsive web apps using React, Next.js, and production-grade tooling.",
    duration: "20 Weeks",
    level: "Beginner",
    icon: Globe2,
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    description: "Build cross-platform iOS and Android apps using React Native and modern best practices.",
    duration: "16 Weeks",
    level: "Intermediate",
    icon: Smartphone,
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    description: "Craft user-centered digital experiences through research, prototyping, and design systems.",
    duration: "14 Weeks",
    level: "Beginner",
    icon: Palette,
  },
  {
    slug: "robotics-kids-teens",
    title: "Robotics for Kids & Teens",
    description: "A playful, project-based introduction to robotics, electronics, and computational thinking.",
    duration: "10 Weeks",
    level: "Beginner",
    icon: Bot,
  },
  {
    slug: "digital-literacy",
    title: "Digital Literacy",
    description: "Foundational computer, productivity, and online safety skills for the modern workplace.",
    duration: "8 Weeks",
    level: "Beginner",
    icon: GraduationCap,
  },
];

export const COHORTS = [
  { programme: "Cybersecurity Specialist", date: "September 15, 2026", duration: "16 Weeks • Evening", mode: "Hybrid" },
  { programme: "Full-Stack Web Development", date: "October 02, 2026", duration: "20 Weeks • Full-time", mode: "Physical" },
  { programme: "Data Science & Analytics", date: "October 14, 2026", duration: "20 Weeks • Weekends", mode: "Online" },
  { programme: "AI Awareness for Leaders", date: "November 05, 2026", duration: "6 Weeks • Evenings", mode: "Online" },
  { programme: "UI/UX Design Studio", date: "November 20, 2026", duration: "14 Weeks • Hybrid", mode: "Hybrid" },
];

export const EVENTS = [
  {
    title: "Nairobi Cybersecurity Awareness Week",
    type: "Workshop",
    date: "Aug 22, 2026",
    location: "Staken Hub Campus, Nairobi",
    description: "Five days of practical sessions on phishing, identity, and incident response for working professionals.",
  },
  {
    title: "AI for African Founders Seminar",
    type: "Seminar",
    date: "Sep 09, 2026",
    location: "Virtual",
    description: "How founders across the continent are using AI to ship faster, serve more users, and stay lean.",
  },
  {
    title: "Build-a-Thon: Climate Tech",
    type: "Hackathon",
    date: "Oct 18–20, 2026",
    location: "Eldoret Innovation Hub",
    description: "A 48-hour hackathon to prototype climate-resilient tools with mentorship from industry engineers.",
  },
  {
    title: "Women in Tech: Career Webinar",
    type: "Webinar",
    date: "Nov 02, 2026",
    location: "Virtual",
    description: "Alumni and industry leaders share career paths, hiring playbooks, and mentorship opportunities.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Sarah Kamau",
    role: "Cloud Engineer at TechGiant",
    quote:
      "Staken Hub didn't just teach me to code — they taught me to think like an engineer. The capstone project with a real client made the difference when I interviewed.",
    img: "alumni-1",
  },
  {
    name: "David Otieno",
    role: "Data Scientist at Safari Analytics",
    quote:
      "The mentorship was unmatched. My mentor coached me through projects, mock interviews, and salary negotiation. I tripled my income in a year.",
    img: "alumni-2",
  },
  {
    name: "Amina Hassan",
    role: "Security Analyst at FinGuard",
    quote:
      "From zero security background to a SOC analyst role in 5 months. The hands-on labs and CTF challenges were exactly what employers were looking for.",
    img: "alumni-3",
  },
];
