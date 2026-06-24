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
    description: "Master ethical hacking, network defense, and threat intelligence to protect digital infrastructure.",
    duration: "16 Weeks",
    level: "Intermediate",
    icon: Shield,
  },
  {
    slug: "networking",
    title: "Networking",
    description: "Understand network architecture, routing protocols, and hardware configuration for modern networks.",
    duration: "12 Weeks",
    level: "Beginner",
    icon: Globe2,
  },
  {
    slug: "programming-languages",
    title: "Programming Languages",
    description: "Learn industry-standard programming with Python and C++ through hands-on, project-based tracks.",
    duration: "4 Weeks",
    level: "Beginner",
    icon: Code2,
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
    slug: "digital-literacy",
    title: "Digital Literacy",
    description: "Foundational computer, productivity, and online safety skills for the modern workplace.",
    duration: "8 Weeks",
    level: "Beginner",
    icon: GraduationCap,
  },
  {
    slug: "robotics-coding-for-kids",
    title: "Robotics and Coding for Kids",
    description: "A fun, hands-on introduction to Scratch coding, logical thinking, electronics, and building simple interactive robots.",
    duration: "2 Weeks",
    level: "Beginner",
    icon: Bot,
  },
];

export const COHORTS = [
  { programme: "Programming Languages (C++ & Python)", date: "July 01, 2026", duration: "4 Weeks • Hybrid", mode: "Hybrid" },
  { programme: "Robotics and Coding for Kids", date: "August Holiday, 2026", duration: "2 Weeks • Weekends", mode: "Online" },
];

export const EVENTS = [
  {
    title: "Malindi Cybersecurity Awareness Week",
    type: "Workshop",
    date: "Aug 22, 2026",
    location: "Staken Hub Campus, Malindi",
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
