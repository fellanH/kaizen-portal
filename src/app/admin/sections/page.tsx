import fs from "fs";
import path from "path";
import { SectionsClient, type TemplateData } from "./sections-client";

const TEMPLATES_DIR = path.join(process.cwd(), "..", "templates", "exported");

const CATEGORY_MAP: Record<string, string> = {
  hero: "Heroes",
  feature: "Features",
  about: "About",
  cta: "CTAs",
  nav: "Navigation",
  footer: "Footers",
  stats: "Stats",
  testimonial: "Testimonials",
  faq: "FAQ",
  contact: "Contact",
  pricing: "Pricing",
  portfolio: "Portfolio",
  gallery: "Gallery",
  blog: "Blog",
  logos: "Logos",
  process: "Process",
  banner: "Other",
  comparison: "Other",
  cookie: "Other",
  page: "Other",
};

function getCategory(filename: string): string {
  const base = filename.replace(".html", "");
  for (const [prefix, cat] of Object.entries(CATEGORY_MAP)) {
    if (base.startsWith(prefix)) return cat;
  }
  return "Other";
}

function fillSlots(html: string): string {
  // Remove conditional block markers but keep content
  let filled = html.replace(/<!--\s*\{\{\?(\w+)\}\}\s*-->/g, "");
  filled = filled.replace(/<!--\s*\{\{\/(\w+)\}\}\s*-->/g, "");
  // Remove loop markers but keep content (show one iteration)
  filled = filled.replace(/<!--\s*\{\{#(\w+)\}\}\s*-->/g, "");

  // Replace slot values with dummy content
  const slotDefaults: Record<string, string> = {
    heading: "Transforming Ideas Into Reality",
    tagline: "Our Approach",
    description: "We craft exceptional digital experiences that drive growth and inspire engagement. Our team delivers results that exceed expectations.",
    logo_text: "Brand",
    cta_primary_text: "Get Started",
    cta_primary_href: "#",
    cta_secondary_text: "Learn More",
    cta_secondary_href: "#",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' fill='%23e8e6e3'%3E%3Crect width='800' height='600'/%3E%3Ctext x='400' y='300' text-anchor='middle' fill='%23999' font-size='24'%3EImage%3C/text%3E%3C/svg%3E",
    image_alt: "Placeholder image",
    bg_class: "",
    href: "#",
    label: "Link",
    name: "Alex Johnson",
    role: "Lead Designer",
    quote: "Working with this team has been an absolute game-changer for our business. The results speak for themselves.",
    author: "Sarah Chen",
    author_role: "CEO, TechFlow",
    stat_value: "98%",
    stat_label: "Client Satisfaction",
    title: "Building the Future of Digital",
    date: "March 2026",
    price: "$49",
    period: "/month",
    plan_name: "Professional",
    feature: "Unlimited projects",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    copyright: "2026 Brand. All rights reserved.",
    email: "hello@example.com",
    phone: "+1 (555) 000-0000",
    address: "123 Innovation Drive, Suite 200",
  };

  filled = filled.replace(/\{\{(\w+)\}\}/g, (_match, slot) => {
    return slotDefaults[slot] || slot.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  });

  return filled;
}

export default function AdminSectionsPage() {
  // Read CSS
  let css = "";
  try {
    css = fs.readFileSync(path.join(TEMPLATES_DIR, "kaizen.css"), "utf-8");
  } catch {
    css = "/* kaizen.css not found */";
  }

  // Read all HTML templates
  const files = fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".html")).sort();

  const categorized: Record<string, TemplateData[]> = {};

  for (const file of files) {
    const id = file.replace(".html", "");
    const category = getCategory(file);
    const rawHtml = fs.readFileSync(path.join(TEMPLATES_DIR, file), "utf-8");
    const filledHtml = fillSlots(rawHtml);

    if (!categorized[category]) categorized[category] = [];
    categorized[category].push({ id, category, html: filledHtml });
  }

  // Order categories logically
  const categoryOrder = [
    "Navigation", "Heroes", "Features", "About", "Stats", "Process",
    "Testimonials", "Pricing", "Portfolio", "Gallery", "Blog",
    "FAQ", "CTAs", "Logos", "Contact", "Footers", "Other",
  ];

  const orderedCategories = categoryOrder
    .filter((c) => categorized[c]?.length)
    .map((name) => ({ name, templates: categorized[name] }));

  const totalCount = files.length;

  return (
    <SectionsClient
      categories={orderedCategories}
      css={css}
      totalCount={totalCount}
    />
  );
}
