import { TERMS_SECTIONS, TERMS_UPDATED } from "@/lib/terms";
import LegalText from "./LegalText";

/** The full Terms & Conditions text (used on /terms and in the sign-up form). */
export default function TermsContent() {
  return <LegalText updated={TERMS_UPDATED} sections={TERMS_SECTIONS} />;
}
