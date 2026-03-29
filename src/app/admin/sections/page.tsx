"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionDef {
  id: string;
  description: string;
}

interface CategoryDef {
  name: string;
  label: string;
  sections: SectionDef[];
}

const SECTION_CATALOG: CategoryDef[] = [
  {
    name: "headers",
    label: "Headers",
    sections: [
      { id: "header-1", description: "Two-column split hero, text + CTAs left, image right" },
      { id: "header-3", description: "Two-column split hero, text + CTAs left, video thumbnail right" },
      { id: "header-5", description: "Full-height hero, text left-aligned over background image" },
      { id: "header-15", description: "Centered hero, heading + description + CTAs + image below" },
      { id: "header-30", description: "Full-height hero, text and buttons centered over background image" },
      { id: "header-76", description: "Two-column split hero, text left, full-height image right" },
    ],
  },
  {
    name: "layouts",
    label: "Layouts",
    sections: [
      { id: "layout-1", description: "Two-column split, text left, image right" },
      { id: "layout-4", description: "Two-column split, text left, image right (alternate flow)" },
      { id: "layout-12", description: "Two-column split, text + accordion left, image right" },
      { id: "layout-47", description: "Two-column, heading + description + sub-feature bullets with image" },
      { id: "layout-89", description: "Two-column split, heading left, body text + content right" },
      { id: "layout-195", description: "Two-column split, image left, text right" },
      { id: "layout-239", description: "Centered header above 3-column icon-feature cards" },
      { id: "layout-352", description: "Centered text heading over layered background" },
      { id: "layout-356", description: "Sticky-scroll accordion, numbered rows stacking vertically" },
      { id: "layout-393", description: "Centered header above 2+3 column feature card grid" },
      { id: "layout-395", description: "Two-column split, heading + body left, feature list right (dark bg)" },
      { id: "layout-414", description: "Two-column split, heading left, stats/content right (dark bg)" },
    ],
  },
  {
    name: "navbars",
    label: "Navbars",
    sections: [
      { id: "navbar-1", description: "Logo left, nav links center, CTA right, responsive hamburger" },
      { id: "navbar-3", description: "Centered logo, hamburger left, offcanvas drawer" },
      { id: "navbar-6", description: "Logo left, nav links center, CTA buttons right" },
    ],
  },
  {
    name: "footers",
    label: "Footers",
    sections: [
      { id: "footer-1", description: "Multi-column footer with logo, links, and legal" },
      { id: "footer-3", description: "Multi-column footer with newsletter signup" },
      { id: "footer-4", description: "Multi-column footer with social icons" },
      { id: "footer-7", description: "Compact two-row footer with links and legal" },
      { id: "footer-8", description: "Compact single-row footer" },
    ],
  },
  {
    name: "ctas",
    label: "CTAs",
    sections: [
      { id: "cta-1", description: "Centered heading + description + two CTAs" },
      { id: "cta-3", description: "Split CTA with background image, text overlay left" },
      { id: "cta-19", description: "Left-aligned heading + CTAs over background image" },
      { id: "cta-25", description: "Centered heading + description + two buttons, no image" },
      { id: "cta-26", description: "Centered heading + email input/subscribe button" },
    ],
  },
  {
    name: "faqs",
    label: "FAQs",
    sections: [
      { id: "faq-1", description: "Centered header above accordion FAQ items" },
      { id: "faq-3", description: "Two-column, header left, accordion items right" },
    ],
  },
  {
    name: "testimonials",
    label: "Testimonials",
    sections: [
      { id: "testimonial-1", description: "Left header above 2-column testimonial quote cards" },
      { id: "testimonial-5", description: "Left header above 3-column testimonial quote cards" },
      { id: "testimonial-6", description: "Two-column split, video/image left, quote text right" },
      { id: "testimonial-14", description: "Full-width single testimonial carousel" },
      { id: "testimonial-16", description: "Centered header above 3-column bordered testimonial cards" },
      { id: "testimonial-17", description: "Two-column sticky split, heading left, scrolling quotes right" },
    ],
  },
  {
    name: "stats",
    label: "Stats",
    sections: [
      { id: "stats-1", description: "Two-column split, heading + text left, stat items right" },
      { id: "stats-3", description: "Two-column split, heading + text left, stat items right (dark bg)" },
      { id: "stats-11", description: "Heading with dark background, stat grid below" },
    ],
  },
  {
    name: "team",
    label: "Team",
    sections: [
      { id: "team-1", description: "Centered header above 4-column team member grid" },
      { id: "team-2", description: "Centered header above 4-column team member grid (with bios)" },
      { id: "team-6", description: "Centered header above 3-column team member grid" },
    ],
  },
  {
    name: "pricing",
    label: "Pricing",
    sections: [
      { id: "pricing-3", description: "Centered header above single centered pricing card" },
      { id: "pricing-4", description: "Centered header above single featured pricing card" },
      { id: "pricing-8", description: "Centered header above tabbed pricing toggle with single card" },
      { id: "pricing-23", description: "Centered header above tabbed pricing toggle with multi-column cards" },
    ],
  },
  {
    name: "portfolio",
    label: "Portfolio",
    sections: [
      { id: "portfolio-1", description: "Centered header above single-column stacked project rows" },
      { id: "portfolio-2", description: "Centered header above stacked landscape-image project rows" },
    ],
  },
  {
    name: "galleries",
    label: "Galleries",
    sections: [
      { id: "gallery-3", description: "Centered header above 3-column image grid" },
      { id: "gallery-17", description: "Centered header above horizontal image carousel" },
    ],
  },
  {
    name: "logos",
    label: "Logos",
    sections: [
      { id: "logo-1", description: "Centered tagline above flex-wrap logo row" },
      { id: "logo-3", description: "Centered tagline above horizontally looping logo marquee" },
      { id: "logo-4", description: "Two-column split, heading + text left, logo grid right" },
    ],
  },
  {
    name: "blog",
    label: "Blog",
    sections: [
      { id: "blog-1", description: "Centered header above 3-column blog card grid" },
      { id: "blog-post-header-1", description: "Blog post header with title, date, author, hero image" },
    ],
  },
  {
    name: "banners",
    label: "Banners",
    sections: [
      { id: "banner-1", description: "Horizontal bar with icon, text, email input, dismiss button" },
      { id: "banner-2", description: "Sticky bar with icon, text, dismiss button" },
    ],
  },
  {
    name: "timelines",
    label: "Timelines",
    sections: [
      { id: "timeline-1", description: "Two-column sticky split, heading left, scrolling timeline items right" },
      { id: "timeline-2", description: "Two-column sticky split, heading left, scrolling timeline items right (alternate)" },
    ],
  },
  {
    name: "comparisons",
    label: "Comparisons",
    sections: [
      { id: "comparison-1", description: "Centered header above comparison content block" },
    ],
  },
  {
    name: "cookie-consent",
    label: "Cookie Consent",
    sections: [
      { id: "cookie-consent-1", description: "Fixed bottom bar with consent text and accept/reject buttons" },
    ],
  },
  {
    name: "contacts",
    label: "Contacts",
    sections: [
      { id: "contact-1", description: "Two-column split, form left, contact info right" },
      { id: "contact-2", description: "Centered header above contact form" },
      { id: "contact-5", description: "Two-column split, map left, form right" },
    ],
  },
];

const WIREFRAME_BASE =
  "https://raw.githubusercontent.com/fellanH/kaizen/main/templates/sections";

const totalSections = SECTION_CATALOG.reduce((sum, cat) => sum + cat.sections.length, 0);

function SectionPreviewCard({ section, category }: { section: SectionDef; category: string }) {
  const [expanded, setExpanded] = useState(false);
  const wireframePath = `${category}/${section.id}/wireframe.html`;
  const wireframeUrl = `${WIREFRAME_BASE}/${wireframePath}`;

  const iframeSrc = `<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, sans-serif; font-size: 12px; color: #333; background: #fff; overflow: hidden; transform: scale(0.35); transform-origin: top left; width: 285%; }
  section { padding: 24px 16px; }
  .container { max-width: 100%; }
  img { max-width: 100%; height: auto; background: #f0f0f0; }
  button { font-size: 10px; padding: 4px 10px; cursor: default; }
</style>
</head>
<body>
<div id="content">Loading wireframe...</div>
<script>
fetch("${wireframeUrl}")
  .then(r => r.ok ? r.text() : Promise.reject(r.status))
  .then(html => { document.getElementById("content").innerHTML = html; })
  .catch(() => { document.getElementById("content").innerHTML = '<p style="padding:20px;color:#999">Wireframe unavailable</p>'; });
</script>
</body>
</html>`;

  return (
    <div className="border border-foreground/10 rounded-lg overflow-hidden bg-foreground/[0.01] transition-colors hover:border-foreground/20">
      {/* Preview iframe */}
      <div
        className={`bg-white overflow-hidden transition-all ${expanded ? "h-80" : "h-36"}`}
      >
        <iframe
          srcDoc={iframeSrc}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
          title={`Preview of ${section.id}`}
        />
      </div>

      {/* Info bar */}
      <div className="px-3 py-2.5 border-t border-foreground/10 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="font-mono text-xs text-foreground/80 font-medium">{section.id}</span>
          <p className="text-[11px] text-foreground/40 truncate mt-0.5">{section.description}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 text-[10px] text-foreground/30 hover:text-foreground/60 transition-colors"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
    </div>
  );
}

export default function AdminSectionsPage() {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? SECTION_CATALOG.map((cat) => ({
        ...cat,
        sections: cat.sections.filter(
          (s) =>
            s.id.toLowerCase().includes(filter.toLowerCase()) ||
            s.description.toLowerCase().includes(filter.toLowerCase()) ||
            cat.label.toLowerCase().includes(filter.toLowerCase())
        ),
      })).filter((cat) => cat.sections.length > 0)
    : SECTION_CATALOG;

  const filteredCount = filtered.reduce((sum, cat) => sum + cat.sections.length, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-foreground">
            Section Catalog
          </h1>
          <p className="text-sm text-foreground/40 mt-1">
            {totalSections} sections across {SECTION_CATALOG.length} categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter sections..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-0 border-b border-foreground/20 bg-transparent px-0 py-1.5 text-sm text-foreground outline-none transition-colors duration-300 focus:border-primary/60 w-48 placeholder:text-foreground/30"
          />
          {filter && (
            <Badge variant="outline" className="border-foreground/20 text-foreground/50 text-xs">
              {filteredCount} match{filteredCount !== 1 ? "es" : ""}
            </Badge>
          )}
        </div>
      </div>

      {filtered.map((category) => (
        <div key={category.name} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-foreground/60 uppercase tracking-wider">
              {category.label}
            </h2>
            <Badge variant="outline" className="border-foreground/10 text-foreground/30 text-[10px]">
              {category.sections.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {category.sections.map((section) => (
              <SectionPreviewCard
                key={section.id}
                section={section}
                category={category.name}
              />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="py-20 text-center text-foreground/30 text-sm">
          No sections match &quot;{filter}&quot;
        </div>
      )}
    </div>
  );
}
