import { TERMS_SECTIONS, TERMS_UPDATED } from "@/lib/terms";

/** The full Terms & Conditions text (used on /terms and in the sign-up form). */
export default function TermsContent() {
  return (
    <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground/90">
      <p className="text-xs text-muted">Last updated: {TERMS_UPDATED}</p>
      {TERMS_SECTIONS.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-foreground">{section.title}</h2>
          {section.paragraphs?.map((text, i) => <p key={i}>{text}</p>)}
          {section.bullets && (
            <ul className="list-disc pl-5 flex flex-col gap-1">
              {section.bullets.map((text, i) => <li key={i}>{text}</li>)}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
