export interface WizardData {
  company: {
    name: string;
    url?: string;
    industry: string;
    description: string;
  };
  style: {
    mood: string;
    references?: string[];
  };
  pages: string[];
  content: {
    messages: Record<string, string>;
    differentiators: string;
    primaryCta: string;
    secondaryCta?: string;
  };
}

export const INITIAL_WIZARD_DATA: WizardData = {
  company: {
    name: "",
    url: "",
    industry: "",
    description: "",
  },
  style: {
    mood: "",
    references: [],
  },
  pages: ["home"],
  content: {
    messages: {},
    differentiators: "",
    primaryCta: "",
    secondaryCta: "",
  },
};

export const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "professional-services", label: "Professional Services" },
  { value: "creative-design", label: "Creative & Design" },
  { value: "trades-construction", label: "Trades & Construction" },
  { value: "beauty-wellness", label: "Beauty & Wellness" },
  { value: "restaurant", label: "Restaurant & Food" },
  { value: "real-estate", label: "Real Estate" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "ecommerce", label: "E-commerce" },
];

export const INDUSTRY_PAGE_PRESETS: Record<string, string[]> = {
  "technology": ["home", "about", "services", "blog", "contact", "pricing"],
  "professional-services": ["home", "about", "services", "contact", "team"],
  "creative-design": ["home", "about", "portfolio", "contact"],
  "trades-construction": ["home", "about", "services", "contact", "gallery"],
  "beauty-wellness": ["home", "about", "services", "contact", "pricing"],
  "restaurant": ["home", "about", "contact", "gallery"],
  "real-estate": ["home", "about", "services", "contact", "portfolio"],
  "healthcare": ["home", "about", "services", "contact", "team", "faq"],
  "education": ["home", "about", "services", "contact", "blog", "faq"],
  "ecommerce": ["home", "about", "contact", "faq", "pricing"],
};

export const ALL_PAGES = [
  { value: "home", label: "Home", alwaysChecked: true },
  { value: "about", label: "About" },
  { value: "services", label: "Services" },
  { value: "portfolio", label: "Portfolio / Work" },
  { value: "blog", label: "Blog" },
  { value: "contact", label: "Contact" },
  { value: "pricing", label: "Pricing" },
  { value: "team", label: "Team" },
  { value: "faq", label: "FAQ" },
  { value: "testimonials", label: "Testimonials" },
  { value: "gallery", label: "Gallery" },
];

export type MoodKey = "minimal" | "bold" | "elegant" | "warm" | "corporate";

export interface MoodCard {
  key: MoodKey;
  label: string;
  description: string;
  gradient: string;
  accent: string;
}

export const MOODS: MoodCard[] = [
  {
    key: "minimal",
    label: "Minimal",
    description: "Clean, lots of whitespace, muted tones",
    gradient: "linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 50%, #d6d3d1 100%)",
    accent: "#78716c",
  },
  {
    key: "bold",
    label: "Bold",
    description: "Strong colors, large type, high contrast",
    gradient: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #e85325 100%)",
    accent: "#e85325",
  },
  {
    key: "elegant",
    label: "Elegant",
    description: "Dark backgrounds, serif accents, refined",
    gradient: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #c9a84c 100%)",
    accent: "#c9a84c",
  },
  {
    key: "warm",
    label: "Warm",
    description: "Earth tones, friendly, approachable",
    gradient: "linear-gradient(135deg, #fdf6ec 0%, #f5deb3 50%, #d4956a 100%)",
    accent: "#d4956a",
  },
  {
    key: "corporate",
    label: "Corporate",
    description: "Blue/navy, structured, trustworthy",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #93c5fd 100%)",
    accent: "#2563eb",
  },
];
