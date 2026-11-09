export type Project = {
  name: string;
  description: string;
  role: string;
  url: string;
  image: string;
  logo?: string;
  year?: string;
  category: string;
  color: string;
};

export type Profile = {
  name: string;
  shortName: string;
  role: string;
  email: string;
  phone: string;
  portrait: string | null;
  portraitMask: string | null;
  avatarModel: string | null;
  avatarRotationOffset: number;
  resume: string | null;
  bio: string;
  projects: Project[];
  location: string;
  github: string;
  linkedin: string;
  socials: { platform: string; label: string; handle: string; url: string; icon: string }[];
  skills: { label: string; items: string }[];
  experience: { role: string; company: string; period: string; summary: string }[];
};

// Identity, links, logos, roles, and experience come from Hassan's supplied résumé.
export const profile: Profile = {
  name: "Hassan Ibrahim Rano",
  shortName: "Hassan Rano",
  role: "Full-Stack Software Engineer",
  email: "hassanibrahimrano50@gmail.com",
  phone: "+2349061449496",
  portrait: "/hassan-standing.png",
  portraitMask: null,
  avatarModel: null,
  avatarRotationOffset: 0,
  resume: "/hassan-rano-resume.pdf",
  bio: "I'm a full-stack software engineer based in Lafia, Nigeria. I build production web and mobile products, from payment infrastructure and API integrations to marketplaces and secure wallet workflows.",
  location: "Lafia, Nigeria",
  github: "https://github.com/hrano1000",
  linkedin: "https://linkedin.com/in/hassan-ibrahim-0139961a4",
  socials: [
    { platform: "tiktok", label: "TikTok", handle: "@hrano_", url: "https://www.tiktok.com/@hrano_", icon: "tiktok" },
    { platform: "instagram", label: "Instagram", handle: "@hrano_", url: "https://www.instagram.com/hrano_/", icon: "instagram" },
    { platform: "snapchat", label: "Snapchat", handle: "hrano1000", url: "https://www.snapchat.com/add/hrano1000", icon: "snapchat" },
    { platform: "youtube", label: "YouTube", handle: "@hrano_", url: "https://www.youtube.com/@hrano_", icon: "youtube" },
    { platform: "github", label: "GitHub", handle: "hrano1000", url: "https://github.com/hrano1000", icon: "github" },
    { platform: "linkedin", label: "LinkedIn", handle: "Hassan Ibrahim", url: "https://linkedin.com/in/hassan-ibrahim-0139961a4", icon: "linkedin-in" },
  ],
  projects: [
    { name: "SilPay", category: "Payment infrastructure", role: "Full-stack engineering", description: "Dashboards and APIs for virtual accounts, payouts, refunds, and authenticated webhooks.", url: "https://silpay.ng", image: "/projects/silpay.png", logo: "/projects/silpay.png", color: "#e6eff0" },
    { name: "RanoSub", category: "Web & mobile", role: "Full-stack engineering", description: "Next.js and Flutter applications with shared catalogues, wallet ledgers, and queued fulfilment.", url: "https://ranosub.com", image: "/projects/ranosub.png", logo: "/projects/ranosub.png", color: "#eee7f7" },
    { name: "Hausa Plus", category: "Android application", role: "Mobile development", description: "Hausa audio, digital learning, and everyday utility services.", url: "https://play.google.com/store/apps/details?id=com.hausaplus.app&hl=en", image: "/projects/hausa-plus.png", logo: "/projects/hausa-plus.png", color: "#edf2e5" },
    { name: "Deili", category: "Web platform", role: "Software development", description: "", url: "https://deili.ng", image: "/projects/deili.png", logo: "/projects/deili.png", color: "#f8eee3" },
    { name: "i4DataSub", category: "Android application", role: "Mobile development", description: "", url: "https://play.google.com/store/apps/details?id=com.i4datasub.app&hl=en", image: "/projects/i4datasub.jpg", logo: "/projects/i4datasub.jpg", color: "#e3edf2" },
    { name: "vendvtu", category: "Web platform", role: "Software development", description: "", url: "https://vendvtu.com", image: "/projects/vendvtu.png", logo: "/projects/vendvtu.png", color: "#ece9fa" },
  ],
  experience: [
    { role: "Full-Stack Software Engineer & Director", company: "RANO SOFTWARE LTD", period: "2026 — Present", summary: "Payment infrastructure, an API marketplace, and production web and Flutter applications. Provider onboarding, catalogue sync, wallet ledgers, and role-based access." },
    { role: "Full-Stack Software Engineer", company: "Freelance & Contract", period: "2020 — 2022", summary: "Payment, messaging, and cloud API integrations. Python and TypeScript automation and Telegram bots for community operations and reporting." },
  ],
  skills: [
    { label: "Languages", items: "TypeScript, JavaScript, Dart, Python, PHP, SQL" },
    { label: "Web & APIs", items: "React, Next.js, Node.js, NestJS, Laravel, REST APIs, webhooks" },
    { label: "Mobile & data", items: "Flutter, Firebase, PostgreSQL, Supabase, Prisma, Redis" },
    { label: "Testing & delivery", items: "Jest, Vitest, Playwright, Git, Linux, Docker" },
  ],
};
