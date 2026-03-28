"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface BriefSection {
  heading: string;
  content: string;
}

function parseSpecSections(specContent: string): BriefSection[] {
  const sections: BriefSection[] = [];
  const lines = specContent.split("\n");
  let currentHeading = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      if (currentHeading && currentLines.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentLines.join("\n").trim(),
        });
      }
      currentHeading = h2Match[1].trim();
      currentLines = [];
      continue;
    }
    // Skip top-level h1
    if (line.match(/^#\s+/)) {
      if (currentHeading && currentLines.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentLines.join("\n").trim(),
        });
        currentHeading = "";
        currentLines = [];
      }
      continue;
    }
    if (currentHeading) {
      currentLines.push(line);
    }
  }

  // Flush last section
  if (currentHeading && currentLines.length > 0) {
    sections.push({
      heading: currentHeading,
      content: currentLines.join("\n").trim(),
    });
  }

  return sections.filter((s) => s.content.length > 0);
}

/** Render markdown-lite content (lists, bold, inline code) to JSX */
function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1.5 pl-4">
          {listItems.map((item, i) => (
            <li
              key={i}
              className="list-disc text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/30"
            >
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    // H3 subheading
    const h3Match = trimmed.match(/^###\s+(.+)/);
    if (h3Match) {
      flushList();
      elements.push(
        <p
          key={`h3-${elements.length}`}
          className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground/60"
        >
          {h3Match[1]}
        </p>
      );
      continue;
    }

    // List item
    const listMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (listMatch) {
      listItems.push(listMatch[1]);
      continue;
    }

    // Numbered list
    const numMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (numMatch) {
      listItems.push(numMatch[1]);
      continue;
    }

    // Paragraph
    flushList();
    elements.push(
      <p
        key={`p-${elements.length}`}
        className="text-sm leading-relaxed text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
      />
    );
  }

  flushList();
  return <div className="space-y-2">{elements}</div>;
}

/** Format inline markdown: **bold**, `code` */
function inlineFormat(text: string): string {
  return text
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-medium text-foreground">$1</strong>'
    )
    .replace(
      /`(.+?)`/g,
      '<code class="rounded bg-muted px-1 py-0.5 text-xs">$1</code>'
    );
}

export function ProjectBrief({ specContent }: { specContent: string }) {
  const sections = useMemo(
    () => parseSpecSections(specContent),
    [specContent]
  );

  if (sections.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No project brief available yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section, i) => (
        <Card key={i} className="border-border/40">
          <CardContent className="px-5 py-4">
            <p className="text-xs font-medium text-foreground/90">
              {section.heading}
            </p>
            <div className="mt-2">{renderContent(section.content)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
