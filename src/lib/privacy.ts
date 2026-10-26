/**
 * Nepo Privacy Policy, shown on /privacy (the URL given to Google Play and
 * the App Store). Keep it true to what the code does: if a new kind of data
 * is collected or a new provider is added, update this text and the date.
 */
import type { TermsSection } from "./terms";

export const PRIVACY_UPDATED = "25 October 2026";

/** Public support address shown in the policy and on /delete-account. Leave "" until there is one. */
export const SUPPORT_EMAIL = "";

const contact = SUPPORT_EMAIL
  ? `Email the Nepo team at ${SUPPORT_EMAIL}.`
  : "Contact the Nepo team through the app.";

export const PRIVACY_SECTIONS: TermsSection[] = [
  {
    title: "1. About this policy",
    paragraphs: [
      "Nepo is a social platform for Tanzanian businesses, brands and their customers, available as a web app and as mobile apps for Android and iPhone. This policy explains what information Nepo collects, why, who can see it, and the choices you have. It applies to all of Nepo's apps and the website.",
    ],
  },
  {
    title: "2. Information we collect",
    paragraphs: ["Information you give us:"],
    bullets: [
      "Account details: username, full name, email address and password (stored only as a secure hash, never in readable form).",
      "Profile and business details you choose to add: profile photo, bio, website, phone number, business category, address, map location, contact details and opening hours.",
      "Content you create: photos, videos, captions, hashtags, locations you type, comments, stories, reels, highlights and direct messages.",
      "Activity on Nepo: who you follow, likes, saved posts, story views, and the reports and blocks you make.",
    ],
  },
  {
    title: "3. Information collected automatically",
    bullets: [
      "Basic technical data our servers need to run and protect the service, such as your IP address, device or browser type and the time of each request, kept in short-lived server logs.",
      "Sign-in tokens stored on your own device so you stay signed in. They are removed when you log out.",
      "Nepo does not use advertising identifiers, does not track you across other apps or websites, and does not use your device's GPS. The camera, microphone and photo library are only used when you choose to take or upload a photo or video.",
    ],
  },
  {
    title: "4. How we use your information",
    bullets: [
      "To run Nepo: create your account, show your profile and content, deliver messages and notifications, and build your feed, Explore and Reels.",
      "To keep Nepo safe: secure accounts, prevent spam and abuse, review reports, and enforce our Terms & Conditions.",
      "To talk to you about your account and important changes to Nepo.",
      "We do not sell your personal information and we do not use it for advertising.",
    ],
  },
  {
    title: "5. Who can see your information",
    bullets: [
      "Public accounts: your profile, posts, reels and the comments you write can be seen by anyone, including people who are not signed in.",
      "Private accounts: only followers you approve can see your posts, reels and stories. Your name, username, photo and bio stay visible so people can find you.",
      "Your phone number on your personal profile is never shown to other people. Business contact details you add to a business profile are shown publicly so customers can reach you.",
      "Direct messages can be seen only by the people in the conversation.",
      "People you block can't find your profile or see your content, and you won't see theirs.",
    ],
  },
  {
    title: "6. Service providers",
    paragraphs: [
      "We use a small number of trusted companies to run Nepo. They process data only on our behalf and under their own security and privacy commitments:",
    ],
    bullets: [
      "Render: hosts the Nepo servers and database.",
      "Supabase: stores the photos and videos you upload.",
      "Netlify: hosts the Nepo website.",
      "Google Fonts: the mobile apps download their typeface from Google, which receives your IP address when that happens.",
    ],
  },
  {
    title: "7. Where your data is stored",
    paragraphs: [
      "These providers store data on servers outside Tanzania, including in the United States. We transfer data there only as needed to run Nepo and with appropriate safeguards, in line with Tanzania's Personal Data Protection Act, 2022.",
    ],
  },
  {
    title: "8. How long we keep it",
    bullets: [
      "We keep your information for as long as your account exists.",
      "Content you delete is removed from Nepo straight away.",
      "When you delete your account, your profile and everything in it is deleted immediately, as described in section 9. Copies in encrypted backups are overwritten within 30 days.",
      "Reports about content that broke our rules are kept as a safety record. If the person who made a report deletes their account, the report no longer identifies them.",
    ],
  },
  {
    title: "9. Your choices and rights",
    bullets: [
      "See and change your information at any time in Settings: edit your profile, change your password, or make your account private.",
      "Delete any post, reel, story or comment you made.",
      "Delete your account in the app (Settings → Delete account) or at /delete-account on our website. This permanently deletes your profile, posts, reels, stories, highlights, comments, likes, follows, saved posts, the messages you sent and the files you uploaded.",
      "Report content or accounts, and block anyone, from their profile or the post's menu.",
      `You may also ask us to access, correct or delete your personal information. ${contact}`,
    ],
  },
  {
    title: "10. Security",
    paragraphs: [
      "All data travels over encrypted connections (HTTPS). Passwords are stored as secure hashes, sign-in tokens expire and are revoked when you log out or change your password, and uploads are checked before they are stored. No system is perfectly secure, so please use a strong password you don't use anywhere else.",
    ],
  },
  {
    title: "11. Children",
    paragraphs: [
      "Nepo is not for children. You must be at least 18 years old to use it. If we learn that someone under 18 has an account, we will delete it.",
    ],
  },
  {
    title: "12. Changes to this policy",
    paragraphs: [
      "We will update this policy when Nepo changes how it handles information, and change the date at the top. If a change is significant, we will tell you in the app.",
    ],
  },
  {
    title: "13. Contact",
    paragraphs: [`Questions about this policy or your data? ${contact}`],
  },
];
