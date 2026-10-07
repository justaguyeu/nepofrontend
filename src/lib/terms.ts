/**
 * Nepo Terms & Conditions. Shown on /terms and inside the sign-up form.
 * When the text changes, bump TERMS_VERSION here *and* TERMS_VERSION in
 * backend/nepo/settings.py so new consents are recorded against it.
 */
export const TERMS_VERSION = "2026-10-07";
export const TERMS_UPDATED = "7 October 2026";

export interface TermsSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "1. About these Terms",
    paragraphs: [
      "Nepo is a social platform where Tanzanian businesses, brands and creators share posts, reels and stories, message customers, and build a following. These Terms & Conditions (\"Terms\") are an agreement between you and Nepo and apply whenever you create an account or use the Nepo web app.",
      "By ticking \"I have read and agree\" and creating an account, you confirm that you have read these Terms, understand them, and agree to be bound by them. If you do not agree, do not create an account or use Nepo.",
    ],
  },
  {
    title: "2. Who can use Nepo",
    bullets: [
      "You must be at least 18 years old, or the age of legal majority where you live if that is higher.",
      "Every Nepo account is registered as a business account. If you register on behalf of a business, you confirm you are authorised to act for it and to accept these Terms on its behalf.",
      "You may not use Nepo if we have previously suspended or removed your account, or if the law prohibits you from using it.",
    ],
  },
  {
    title: "3. Your account",
    bullets: [
      "Give accurate information when you register and keep it up to date, including your business name, contact details and category.",
      "Keep your password secret and use one you don't use elsewhere. You are responsible for everything that happens under your account.",
      "Tell us straight away if you think someone else has accessed your account.",
      "Do not sell, transfer or share your account, and do not create accounts that impersonate another person or business.",
    ],
  },
  {
    title: "4. Your business and the law",
    paragraphs: [
      "You are solely responsible for running your business lawfully, including holding any licences or permits it needs, meeting your tax obligations, honouring consumer protection rules, and making sure every product or service you promote may legally be offered.",
    ],
  },
  {
    title: "5. Content you post",
    paragraphs: [
      "You keep ownership of the photos, videos, captions, comments, messages and other content you post on Nepo.",
      "By posting content, you give Nepo a non-exclusive, royalty-free, worldwide licence to host, store, display, reproduce and distribute it for the purpose of operating, improving and promoting Nepo. This licence ends when you delete the content or your account, except where the content has been shared with others who have not deleted it, or where we must keep it to comply with the law.",
      "You confirm that you own, or have permission to use, everything you post, and that it does not infringe anyone else's rights.",
    ],
  },
  {
    title: "6. What is not allowed",
    paragraphs: ["You must not use Nepo to post, sell, promote or do any of the following:"],
    bullets: [
      "Anything illegal, including prohibited, stolen or counterfeit goods, unlicensed medicines, weapons, drugs, or wildlife products.",
      "Fraud, scams, pyramid schemes, false or misleading advertising, or fake reviews.",
      "Harassment, bullying, threats, hate speech, or content that incites violence or discrimination.",
      "Sexually explicit content, and any content that sexualises or endangers children.",
      "Spam, including bulk unsolicited messages, follows or comments.",
      "Other people's personal information without their consent.",
      "Content that infringes copyright, trademarks or other intellectual property.",
      "Malware, attempts to break into accounts or systems, or automated scraping or data collection without our written permission.",
    ],
  },
  {
    title: "7. Buying and selling between users",
    paragraphs: [
      "Nepo helps businesses and customers find each other, but Nepo is not a party to any sale, order, payment or delivery arranged between users. Any deal is solely between the buyer and the seller, who are responsible for the quality, safety, legality and delivery of what is sold. Take care before paying anyone you meet on Nepo.",
    ],
  },
  {
    title: "8. Privacy and your data",
    paragraphs: [
      "We collect the information you give us (such as your name, username, email address, profile details and business information), the content you post, your messages, and basic technical information needed to run and secure the service.",
      "We use this information to provide Nepo, to keep accounts and the platform secure, to show your content to the people you share it with, and to communicate with you about your account. Media you upload is stored with our cloud storage provider. We do not sell your personal information.",
      "Your profile, posts and reels are public unless you make your account private, in which case only approved followers can see your posts, reels and stories. Your phone number is never shown to other people. Direct messages are visible only to the people in the conversation.",
      "We process personal data in line with applicable data protection law, including Tanzania's Personal Data Protection Act, 2022. You may ask to access, correct or delete your personal information.",
    ],
  },
  {
    title: "9. Reporting and removing content",
    paragraphs: [
      "We may remove content, limit its reach, or restrict features for any account that we reasonably believe breaks these Terms or the law, or puts other people at risk. If you believe content on Nepo infringes your rights or breaks these Terms, contact the Nepo team so we can review it.",
    ],
  },
  {
    title: "10. Suspension and closing your account",
    paragraphs: [
      "You can stop using Nepo at any time. We may suspend or close your account, with or without notice, if you seriously or repeatedly breach these Terms, if we are required to by law, or if your account creates risk or legal exposure for Nepo or other users. Sections 5, 7, 11 and 13 continue to apply after your account is closed.",
    ],
  },
  {
    title: "11. Disclaimers and limitation of liability",
    paragraphs: [
      "Nepo is provided \"as is\" and \"as available\". We work hard to keep it running and secure, but we cannot promise it will always be available, error-free, or that content posted by users is accurate or safe.",
      "To the fullest extent permitted by law, Nepo is not liable for indirect or consequential losses, lost profits or lost business, or for the conduct, content, products or services of any user. Nothing in these Terms limits liability that cannot be limited by law.",
    ],
  },
  {
    title: "12. Changes to these Terms",
    paragraphs: [
      "We may update these Terms as Nepo evolves or when the law changes. When we make material changes, we will update the date above and let you know in the app. If you keep using Nepo after the changes take effect, you accept the updated Terms.",
    ],
  },
  {
    title: "13. Governing law",
    paragraphs: [
      "These Terms are governed by the laws of the United Republic of Tanzania, and the courts of Tanzania have jurisdiction over any dispute arising from them.",
    ],
  },
  {
    title: "14. Contact",
    paragraphs: [
      "Questions about these Terms or your data can be sent to the Nepo team through the app.",
    ],
  },
];
