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
    slug: "programming-languages",
    title: "Programming Languages (C++ & Python)",
    description: "Learn industry-standard programming with Python and C++ through hands-on, project-based tracks.",
    duration: "12 Weeks",
    level: "Beginner",
    icon: Code2,
  },
  {
    slug: "robotics",
    title: "Robotics",
    description: "Design, build, and program interactive robots while learning electronics and hardware fundamentals.",
    duration: "10 Weeks",
    level: "Beginner",
    icon: Cpu,
  },
  {
    slug: "coding-for-kids",
    title: "Coding for Kids",
    description: "A fun and interactive introduction to visual programming, logical thinking, and creative coding for younger learners.",
    duration: "8 Weeks",
    level: "Beginner",
    icon: GraduationCap,
  },
];

export const COHORTS = [
  { programme: "Programming Languages (C++ & Python)", date: "September 15, 2026", duration: "12 Weeks • Hybrid", mode: "Hybrid" },
  { programme: "Robotics", date: "October 02, 2026", duration: "10 Weeks • Hybrid", mode: "Hybrid" },
  { programme: "Coding for Kids", date: "October 14, 2026", duration: "8 Weeks • Weekends", mode: "Online" },
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
